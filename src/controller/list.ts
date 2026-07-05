import type { Battle } from "../model/battle";
import type { Repository } from "../repository";

import { JsonSchemaUnmatchError } from "../model/error";

export type ListBattles = (repository: Repository) => () => Promise<Battle[]>;
export const listBattles: ListBattles = (repository) => async () => {
  const { battle: battleRepository } = repository;
  const keys = await battleRepository.list();
  const loaded = await Promise.all(keys.map((key) => battleRepository.get(key)));
  // 取得失敗(error/null)は一覧から除外する
  return loaded.filter((battle): battle is Battle => battle !== null && !(battle instanceof JsonSchemaUnmatchError));
};
