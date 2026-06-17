import { v7 as uuidv7 } from "uuid";

export type Confirm = (message: string) => boolean;
export const confirm: Confirm = (message) => window.confirm(message);

export type Notice = (message: string) => void;
export const notice: Notice = async (message) => window.alert(message);

// battleのkey供給。uuid v7を利用する(provider化。controllerから呼び出す)
export type GetUuid = () => string;
export const getUuid: GetUuid = () => uuidv7();

// 日時供給。Turnの履歴記録用の実時刻を返す(provider化)
export type Now = () => Date;
export const now: Now = () => new Date();

export type Dialogue = {
  confirm: Confirm;
  notice: Notice;
  getUuid: GetUuid;
  now: Now;
};
export const dialogue: Dialogue = {
  confirm,
  notice,
  getUuid,
  now,
};
