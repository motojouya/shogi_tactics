// repository層のエラー表現(class)を集約する。BattleDB以外のclass構文はすべてここに置く。

// json schema検証に失敗(保存データが想定の型でない)。
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

// 指定のデータが見つからない(piece/action等のkey参照解決失敗)。
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

// 既に存在するデータを重複登録しようとした。
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

// export(file system access API)に失敗した。
export class CopyFailError {
  readonly fileName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly exception: any;
  readonly message: string;
  constructor(
    fileName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    exception: any,
    message: string,
  ) {
    this.fileName = fileName;
    this.exception = exception;
    this.message = message;
  }
}

// ユーザーが操作をキャンセルした。
export class UserCancel {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

// 必須パラメータが空。
export class EmptyParameter {
  readonly name: string;
  readonly message: string;
  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }
}
