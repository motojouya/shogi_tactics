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
  const result = format(battle, units, local.now());
  if (result instanceof DataExistError) {
    return result;
  }
  await battleRepository.save(result);
  return result;
};
