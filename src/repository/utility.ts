import { z } from "zod";

import { CopyFailError, JsonSchemaUnmatchError } from "./error";

export function parseJson<S extends z.ZodTypeAny>(schema: S): (json: unknown) => z.infer<S> | JsonSchemaUnmatchError {
  return function (json) {
    const result = schema.safeParse(json);
    if (result.success) {
      return result.data;
    } else {
      return new JsonSchemaUnmatchError(result.error, "想定されたjson schemaのデータではありません");
    }
  };
}

const pickerOpts = {
  types: [
    {
      description: "JSON",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
  excludeAcceptAllOption: true,
};

export type ImportJsonFile = <S extends z.ZodTypeAny>(schema: S) => Promise<z.infer<S> | JsonSchemaUnmatchError>;
export const importJsonFile: ImportJsonFile = async (schema) => {
  // @ts-expect-error window is not defined
  const [fileHandle] = await window.showOpenFilePicker({ ...pickerOpts, multiple: false });
  const file = await fileHandle.getFile();
  const text = await file.text();
  return parseJson(schema)(JSON.parse(text));
};

export type ExportJsonFile = (data: unknown, fileName: string) => Promise<CopyFailError | null>;
export const exportJsonFile: ExportJsonFile = async (data, fileName) => {
  // @ts-expect-error window is not defined
  const newHandle = await window.showSaveFilePicker({ ...pickerOpts, suggestedName: `${fileName}.json` });
  const writableStream = await newHandle.createWritable();
  await writableStream.write(JSON.stringify(data));
  await writableStream.close();
  return null;
};

export type MemoryRepository<T> = {
  get: (name: string) => T | null;
  list: string[];
  all: T[];
};

export type CreateMemoryRepository<T> = (items: Record<string, T>) => MemoryRepository<T>;
export const createMemoryRepository = <T>(items: Record<string, T>): MemoryRepository<T> => ({
  get: (name) => items[name],
  list: Object.keys(items),
  all: Object.values(items),
});

export type SelectOption = {
  value: string;
  label: string;
};
