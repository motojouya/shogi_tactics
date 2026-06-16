import type { Battle } from "../../model/battle";
import type { UnitReference } from "../../model/unit";
import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";

import { GameFirst, GameSecond, copyBattle, surrender as modelSurrender } from "../../model/battle";
import { UserCancel } from "../../io/window_dialogue";

export type Surrender = (
  battleRepository: BattleRepository,
  dialogue: Dialogue,
) => (battle: Battle, actor: UnitReference, actionDate: Date) => Promise<null | UserCancel>;
export const surrender: Surrender = (battleRepository, dialogue) => async (battle, actor, actionDate) => {
  if (!dialogue.confirm("降参してもよいですか？")) {
    return new UserCancel("降参していません");
  }

  const newBattle = copyBattle(battle);
  newBattle.turns.push(modelSurrender(newBattle, actor, actionDate));
  // 降参したsideの負け。
  newBattle.result = actor.side === "FIRST" ? GameSecond : GameFirst;
  await battleRepository.save(newBattle);
  return null;
};
