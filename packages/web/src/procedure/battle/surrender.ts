import type { Battle } from "@motojouya/kniw-core/model/battle";
import type { CharactorBattling } from "@motojouya/kniw-core/model/charactor";
import type { BattleRepository } from "@motojouya/kniw-core/store/battle";
import type { Dialogue } from "../../io/window_dialogue";
import type { Randoms } from "@motojouya/kniw-core/model/random";

import { GameHome, GameVisitor, surrender as modelSurrender } from "@motojouya/kniw-core/model/battle";
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
