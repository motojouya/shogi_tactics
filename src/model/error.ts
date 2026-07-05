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

export class UserCancel {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export class EmptyParameter {
  readonly name: string;
  readonly message: string;
  constructor(name: string, message: string) {
    this.name = name;
    this.message = message;
  }
}
