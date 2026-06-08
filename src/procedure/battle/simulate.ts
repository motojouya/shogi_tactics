import type { CharactorBattling } from "../../model/charactor";
import type { Battle } from "../../model/battle";
import type { Turn } from "../../model/turn";
import type { Skill } from "../../model/skill";

import { actToCharactor } from "../../model/battle";
import { toReceiver } from "../../form/battle";
import { createAbsolute } from "../../model/random";
import { DataNotFoundError } from "../../store_utility/schema";

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
