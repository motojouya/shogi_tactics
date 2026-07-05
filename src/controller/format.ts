import type { Battle } from "../model/battle";
import type { Unit } from "../model/unit";
import type { Repository } from "../repository";

import { format } from "../model/battle";
import { DataExistError } from "../model/error";

export type FormatBattle = (
  repository: Repository,
) => (battle: Battle, units: Unit[]) => Promise<Battle | DataExistError>;
export const formatBattle: FormatBattle = (repository) => async (battle, units) => {
  const { battle: battleRepository, local } = repository;
  // 編成中(先頭Turn未生成)でなければ既に開始済み。二重開始を防ぐ。
  if (battle.turns.length !== 0) {
    return new DataExistError(battle.key, "battle", "この対戦は既に開始されています");
  }
  const newBattle = format(battle, units, local.now());
  await battleRepository.save(newBattle);
  return newBattle;
};
