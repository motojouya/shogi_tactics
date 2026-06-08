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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type KeyValue = { [name: string]: any };

export type CheckNamespace = (namespace: string) => Promise<void>;
export type Save = (namespace: string, objctKey: string, data: KeyValue) => Promise<void>;
export type List = (namespace: string) => Promise<string[]>;
export type Get = (namespace: string, objctKey: string) => Promise<KeyValue | null>;
export type Remove = (namespace: string, objctKey: string) => Promise<void>;
export type ExportJson = (json: object, fileName: string) => Promise<null | CopyFailError>;
export type ImportJson = (fileName: string) => Promise<object | null>;

export type Database = {
  checkNamespace: CheckNamespace;
  save: Save;
  list: List;
  get: Get;
  remove: Remove;
  importJson: ImportJson;
  exportJson: ExportJson;
};
