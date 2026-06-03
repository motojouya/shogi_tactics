import type { Database } from "../io/database";
import type { ToModel, ToJson } from "./schema";

import { z } from "zod";
import { CopyFailError } from "../io/database";
import { parseJson, JsonSchemaUnmatchError } from "./schema";

export type Save<M extends Record<string, unknown>> = (obj: M) => Promise<void>;
export type Get<M extends Record<string, unknown>, E> = (
  name: string,
) => Promise<M | E | JsonSchemaUnmatchError | null>;
export type Remove = (name: string) => Promise<void>;
export type List = () => Promise<string[]>;
export type ImportJson<M extends Record<string, unknown>, E> = (
  fileName: string,
) => Promise<M | E | JsonSchemaUnmatchError | null>;
export type ExportJson<M extends Record<string, unknown>> = (obj: M, fileName: string) => Promise<CopyFailError | null>;

export type Repository<M extends Record<string, unknown>, E> = {
  save: Save<M>;
  list: List;
  get: Get<M, E | JsonSchemaUnmatchError>;
  remove: Remove;
  importJson: ImportJson<M, E | JsonSchemaUnmatchError>;
  exportJson: ExportJson<M>;
};

const createSave =
  <M extends Record<string, unknown>, J extends Record<string, unknown>>(
    namespace: string,
    key: string,
    toJson: ToJson<M, J>,
  ) =>
  (database: Database): Save<M> =>
  async (obj) =>
    database.save(namespace, obj[key] as string, toJson(obj));

type CreateList = (namespace: string) => (database: Database) => List;
const createList: CreateList = (namespace) => (database) => async () => database.list(namespace);

const createGet =
  <S extends z.ZodTypeAny, M extends Record<string, unknown>, J extends Record<string, unknown>, E>(
    namespace: string,
    schema: S,
    toModel: ToModel<M, J, E>,
  ) =>
  (database: Database): Get<M, E | JsonSchemaUnmatchError> =>
  async (name) => {
    const result = await database.get(namespace, name);
    if (!result) {
      return null;
    }

    const json = parseJson(schema)(result);
    if (json instanceof JsonSchemaUnmatchError) {
      return json;
    }

    return toModel(json);
  };

type CreateRemove = (namespace: string) => (database: Database) => Remove;
const createRemove: CreateRemove = (namespace: string) => (database) => async (name) =>
  database.remove(namespace, name);

const createImportJson =
  <S extends z.ZodTypeAny, M extends Record<string, unknown>, J extends Record<string, unknown>, E>(
    schema: S,
    toModel: ToModel<M, J, E>,
  ) =>
  (database: Database): ImportJson<M, E | JsonSchemaUnmatchError> =>
  async (fileName) => {
    const result = await database.importJson(fileName);
    if (!result) {
      return null;
    }

    const json = parseJson(schema)(result);
    if (json instanceof JsonSchemaUnmatchError) {
      return json;
    }

    return toModel(json);
  };

const createExportJson =
  <M extends Record<string, unknown>, J extends Record<string, unknown>>(toJson: ToJson<M, J>) =>
  (database: Database): ExportJson<M> =>
  async (obj, fileName) =>
    database.exportJson(toJson(obj), fileName);

export const createRepository =
  <S extends z.ZodTypeAny, M extends Record<string, unknown>, J extends Record<string, unknown>, E>(
    namespace: string,
    schema: S,
    toModel: ToModel<M, J, E>,
    toJson: ToJson<M, J>,
    key: string,
  ) =>
  async (database: Database): Promise<Repository<M, E>> => {
    await database.checkNamespace(namespace);
    return {
      save: createSave(namespace, key, toJson)(database),
      list: createList(namespace)(database),
      get: createGet(namespace, schema, toModel)(database),
      remove: createRemove(namespace)(database),
      importJson: createImportJson(schema, toModel)(database),
      exportJson: createExportJson(toJson)(database),
    };
  };
