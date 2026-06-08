import type { Battle } from "../../model/battle";
import type { CharactorBattling } from "../../model/charactor";
import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";
import type { Randoms } from "../../model/random";

import { GameHome, GameVisitor, surrender as modelSurrender } from "../../model/battle";
import { UserCancel } from "../../io/window_dialogue";

export type Surrender = (
  battleRepository: BattleRepository,
  dialogue: Dialogue,
) => (battle: Battle, actor: CharactorBattling, actionDate: Date, randoms: Randoms) => Promise<null | UserCancel>;
export const surrender: Surrender = (battleRepository, dialogue) => async (battle, actor, actionDate, randoms) => {
  if (!dialogue.confirm("降参してもよいですか？")) {
    return new UserCancel("降参していません");
  }

  const turn = modelSurrender(battle, actor, actionDate, randoms);
  battle.turns.push(turn);
  await battleRepository.save({
    ...battle,
    result: actor.isVisitor ? GameHome : GameVisitor,
  });
  return null;
};
