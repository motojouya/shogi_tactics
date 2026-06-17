import type { Database } from "./database";

import { z } from "zod";
import { CopyFailError } from "./database";
import { parseJson, JsonSchemaUnmatchError } from "./schema";

// model型(=zod schema)をそのまま保存・取得する。datetimeはz.coerce.date()でDate統一済みのためconverterは不要。
// 取得時はschema検証(parseJson)を通すだけで、検証を通ればそのままmodel。
export type Save<M extends Record<string, unknown>> = (obj: M) => Promise<void>;
export type Get<M extends Record<string, unknown>> = (name: string) => Promise<M | JsonSchemaUnmatchError | null>;
export type Remove = (name: string) => Promise<void>;
export type List = () => Promise<string[]>;
export type ImportJson<M extends Record<string, unknown>> = (
  fileName: string,
) => Promise<M | JsonSchemaUnmatchError | null>;
export type ExportJson<M extends Record<string, unknown>> = (obj: M, fileName: string) => Promise<CopyFailError | null>;

export type Repository<M extends Record<string, unknown>> = {
  save: Save<M>;
  list: List;
  get: Get<M>;
  remove: Remove;
  importJson: ImportJson<M>;
  exportJson: ExportJson<M>;
};

const createSave =
  <M extends Record<string, unknown>>(namespace: string, key: string) =>
  (database: Database): Save<M> =>
  async (obj) =>
    database.save(namespace, obj[key] as string, obj);

type CreateList = (namespace: string) => (database: Database) => List;
const createList: CreateList = (namespace) => (database) => async () => database.list(namespace);

const createGet =
  <S extends z.ZodType<M>, M extends Record<string, unknown>>(namespace: string, schema: S) =>
  (database: Database): Get<M> =>
  async (name) => {
    const result = await database.get(namespace, name);
    if (!result) {
      return null;
    }

    return parseJson(schema)(result);
  };

type CreateRemove = (namespace: string) => (database: Database) => Remove;
const createRemove: CreateRemove = (namespace: string) => (database) => async (name) =>
  database.remove(namespace, name);

const createImportJson =
  <S extends z.ZodType<M>, M extends Record<string, unknown>>(schema: S) =>
  (database: Database): ImportJson<M> =>
  async (fileName) => {
    const result = await database.importJson(fileName);
    if (!result) {
      return null;
    }

    return parseJson(schema)(result);
  };

const createExportJson =
  <M extends Record<string, unknown>>() =>
  (database: Database): ExportJson<M> =>
  async (obj, fileName) =>
    database.exportJson(obj, fileName);

export const createRepository =
  <S extends z.ZodType<M>, M extends Record<string, unknown>>(namespace: string, schema: S, key: string) =>
  async (database: Database): Promise<Repository<M>> => {
    await database.checkNamespace(namespace);
    return {
      save: createSave<M>(namespace, key)(database),
      list: createList(namespace)(database),
      get: createGet<S, M>(namespace, schema)(database),
      remove: createRemove(namespace)(database),
      importJson: createImportJson<S, M>(schema)(database),
      exportJson: createExportJson<M>()(database),
    };
  };
