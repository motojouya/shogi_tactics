import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { Repository } from "../repository";

import { GameFirst, GameSecond, copyBattle, surrender as modelSurrender } from "../model/battle";
import { UserCancel } from "../model/error";

export type Surrender = (
  repository: Repository,
) => (battle: Battle, actor: UnitReference, actionDate: Date) => Promise<null | UserCancel>;
export const surrender: Surrender = (repository) => async (battle, actor, actionDate) => {
  const { battle: battleRepository, local } = repository;
  if (!local.confirm("降参してもよいですか？")) {
    return new UserCancel("降参していません");
  }

  const newBattle = copyBattle(battle);
  newBattle.turns.push(modelSurrender(newBattle, actor, actionDate));
  newBattle.result = actor.side === "FIRST" ? GameSecond : GameFirst;
  await battleRepository.save(newBattle);
  return null;
};
