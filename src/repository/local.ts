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

// step15(S10/§7.5b): routing(画面遷移/検索パラメータ取得)をLocal(環境provider)のメソッドへ移設。
const urlPrefix = import.meta.env.VITE_URL_PREFIX;

// 画面遷移。VITE_URL_PREFIXがあれば付与してwindow.location.assignする。
export type Transit = (path: string) => void;
export const transit: Transit = (path) => {
  let assignPath = path;
  if (urlPrefix) {
    assignPath = "/" + urlPrefix + path;
  }
  window.location.assign(assignPath);
};

// 現在URLのクエリ文字列をURLSearchParamsで返す。
export type GetSearchParams = () => URLSearchParams;
export const getSearchParams: GetSearchParams = () => new URLSearchParams(window.location.search);

export type Local = {
  confirm: Confirm;
  notice: Notice;
  getUuid: GetUuid;
  now: Now;
  transit: Transit;
  getSearchParams: GetSearchParams;
};
export const local: Local = {
  confirm,
  notice,
  getUuid,
  now,
  transit,
  getSearchParams,
};
