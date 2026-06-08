import { z } from "zod";

export type ToModel<M, J, E> = (json: J) => M | E;
export type ToJson<M, J> = (model: M) => J;

export class JsonSchemaUnmatchError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly error: any;
  readonly message: string;
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    message: string,
  ) {
    this.error = error;
    this.message = message;
  }
}

export class DataNotFoundError {
  readonly name: string;
  readonly type: string;
  readonly message: string;
  constructor(name: string, type: string, message: string) {
    this.name = name;
    this.type = type;
    this.message = message;
  }
}

export class DataExistError {
  readonly name: string;
  readonly type: string;
  readonly message: string;
  constructor(name: string, type: string, message: string) {
    this.name = name;
    this.type = type;
    this.message = message;
  }
}

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
