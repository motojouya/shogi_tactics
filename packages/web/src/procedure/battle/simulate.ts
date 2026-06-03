import type { CharactorBattling } from "@motojouya/kniw-core/model/charactor";
import type { Battle } from "@motojouya/kniw-core/model/battle";
import type { Turn } from "@motojouya/kniw-core/model/turn";
import type { Skill } from "@motojouya/kniw-core/model/skill";

import { actToCharactor } from "@motojouya/kniw-core/model/battle";
import { toReceiver } from "../../form/battle";
import { createAbsolute } from "@motojouya/kniw-core/model/random";
import { DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";

export type Simulated = { survive: boolean; receiver: CharactorBattling };

export type Simulate = (
  battle: Battle,
  actor: CharactorBattling,
  skill: Skill,
  receiverWithIsVisitor: string,
  lastTurn: Turn,
  actionDate: Date,
) => Simulated | DataNotFoundError;
export const simulate: Simulate = (battle, actor, skill, receiverWithIsVisitor, lastTurn, actionDate) => {
  const receiver = toReceiver(receiverWithIsVisitor, lastTurn.sortedCharactors);
  if (receiver instanceof DataNotFoundError) {
    return receiver;
  }

  const newTurn = actToCharactor(battle, actor, skill, [receiver], actionDate, createAbsolute());
  const survivedReceiver = newTurn.sortedCharactors.find(
    (charactor) => charactor.isVisitor === receiver.isVisitor && charactor.name === receiver.name,
  );

  const survive = !!survivedReceiver;

  return {
    receiver: survive ? survivedReceiver : receiver,
    survive,
  };
};
