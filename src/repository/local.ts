import { v7 as uuidv7 } from "uuid";

export type Confirm = (message: string) => boolean;
export const confirm: Confirm = (message) => window.confirm(message);

export type Notice = (message: string) => void;
export const notice: Notice = async (message) => window.alert(message);

export type GetUuid = () => string;
export const getUuid: GetUuid = () => uuidv7();

export type Now = () => Date;
export const now: Now = () => new Date();

const urlPrefix = import.meta.env.VITE_URL_PREFIX;

export type Transit = (path: string) => void;
export const transit: Transit = (path) => {
  let assignPath = path;
  if (urlPrefix) {
    assignPath = "/" + urlPrefix + path;
  }
  window.location.assign(assignPath);
};

export type GetSearchParams = () => URLSearchParams;
export const getSearchParams: GetSearchParams = () => new URLSearchParams(window.location.search);

/**
 * ブラウザ環境をRepositoryとして提供
 * window変数の機能、日付、uuidなど
 */
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
