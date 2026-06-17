import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";

import { GameFirst, GameSecond, copyBattle, surrender as modelSurrender } from "../model/battle";
import { UserCancel } from "../repository/error";

export type Surrender = (
  battleRepository: BattleRepository,
  local: Local,
) => (battle: Battle, actor: UnitReference, actionDate: Date) => Promise<null | UserCancel>;
export const surrender: Surrender = (battleRepository, local) => async (battle, actor, actionDate) => {
  if (!local.confirm("降参してもよいですか？")) {
    return new UserCancel("降参していません");
  }

  const newBattle = copyBattle(battle);
  newBattle.turns.push(modelSurrender(newBattle, actor, actionDate));
  // 降参したsideの負け。
  newBattle.result = actor.side === "FIRST" ? GameSecond : GameFirst;
  await battleRepository.save(newBattle);
  return null;
};
