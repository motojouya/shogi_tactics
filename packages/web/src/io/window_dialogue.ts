export type Confirm = (message: string) => boolean;
export const confirm: Confirm = (message) => window.confirm(message);

export type Notice = (message: string) => void;
export const notice: Notice = async (message) => window.alert(message);

export type Dialogue = {
  confirm: Confirm;
  notice: Notice;
};
export const dialogue: Dialogue = {
  confirm,
  notice,
};

export class UserCancel {
  constructor(readonly message: string) {}
}

export class EmptyParameter {
  constructor(
    readonly name: string,
    readonly message: string,
  ) {}
}
