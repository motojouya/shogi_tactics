import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { Repository } from "../repository";

import { surrenderBattle } from "../model/battle";
import { UserCancel, InvalidArgumentError } from "../model/error";

export type Surrender = (
  repository: Repository,
) => (battle: Battle, actor: UnitReference) => Promise<null | UserCancel | InvalidArgumentError>;
export const surrender: Surrender = (repository) => async (battle, actor) => {
  const { battle: battleRepository, local } = repository;
  if (!local.confirm("降参してもよいですか？")) {
    return new UserCancel("降参していません");
  }

  const newBattle = surrenderBattle(battle, actor, local.now());
  if (newBattle instanceof InvalidArgumentError) {
    return newBattle;
  }
  await battleRepository.save(newBattle);
  return null;
};
