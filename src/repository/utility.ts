import { z } from "zod";

import { CopyFailError, JsonSchemaUnmatchError } from "./error";

// 旧schema.ts: json schema検証。schema.safeParseを通し、失敗はJsonSchemaUnmatchErrorで返す。
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

// step15(S9/§7.5a): File System Access APIによるJSON import/exportの詳細をここに集約する。
// repository(battle等)はこれらを呼ぶだけで、pickerOpts等の詳細は持たない。
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

// ファイルを開いてJSONとして読み、渡したschemaで検証する。
export type ImportJsonFile = <S extends z.ZodTypeAny>(schema: S) => Promise<z.infer<S> | JsonSchemaUnmatchError>;
export const importJsonFile: ImportJsonFile = async (schema) => {
  // @ts-expect-error window is not defined
  const [fileHandle] = await window.showOpenFilePicker({ ...pickerOpts, multiple: false });
  const file = await fileHandle.getFile();
  const text = await file.text();
  return parseJson(schema)(JSON.parse(text));
};

// dataをJSON文字列化し、保存ダイアログで選んだファイルへ書き出す。
export type ExportJsonFile = (data: unknown, fileName: string) => Promise<CopyFailError | null>;
export const exportJsonFile: ExportJsonFile = async (data, fileName) => {
  // @ts-expect-error window is not defined
  const newHandle = await window.showSaveFilePicker({ ...pickerOpts, suggestedName: `${fileName}.json` });
  const writableStream = await newHandle.createWritable();
  await writableStream.write(JSON.stringify(data));
  await writableStream.close();
  return null;
};

// 旧memory_repository.ts: メモリ常駐データ(piece/action/status)のrepository。
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

// 旧dialogue.ts: UI select用の選択肢。
export type SelectOption = {
  value: string;
  label: string;
};
