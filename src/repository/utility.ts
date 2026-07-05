import { z } from "zod";

import { CopyFailError, JsonSchemaUnmatchError } from "../model/error";

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

export type ImportJsonFile = () => Promise<string>;
export const importJsonFile: ImportJsonFile = async () => {
  // @ts-expect-error window is not defined
  const [fileHandle] = await window.showOpenFilePicker({ ...pickerOpts, multiple: false });
  const file = await fileHandle.getFile();
  return file.text();
};

export type ExportJsonFile = (data: string, fileName: string) => Promise<CopyFailError | null>;
export const exportJsonFile: ExportJsonFile = async (data, fileName) => {
  // @ts-expect-error window is not defined
  const newHandle = await window.showSaveFilePicker({ ...pickerOpts, suggestedName: `${fileName}.json` });
  const writableStream = await newHandle.createWritable();
  await writableStream.write(data);
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
