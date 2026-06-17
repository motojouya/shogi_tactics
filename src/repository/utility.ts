import { z } from "zod";

import { JsonSchemaUnmatchError } from "./error";

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
