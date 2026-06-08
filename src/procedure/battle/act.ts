import type { Battle } from "../../model/battle";
import type { Turn } from "../../model/turn";
import type { CharactorBattling } from "../../model/charactor";
import type { BattleRepository } from "../../store/battle";
import type { DoSkillForm } from "../../form/battle";
import type { Dialogue } from "../../io/window_dialogue";
import type { Randoms } from "../../model/random";

import { spendTurn } from "../../model/battle";
import { toAction, ReceiverDuplicationError } from "../../form/battle";
import { DataNotFoundError } from "../../store_utility/schema";
import { UserCancel } from "../../io/window_dialogue";

export type Act = (
  dialogue: Dialogue,
  repository: BattleRepository,
) => (
  battle: Battle,
  actor: CharactorBattling,
  doSkillForm: DoSkillForm,
  lastTurn: Turn,
  getDate: () => Date,
  getRandoms: () => Randoms,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (dialogue, repository) => async (battle, actor, doSkillForm, lastTurn, getDate, getRandoms) => {
  const doAction = toAction(doSkillForm, lastTurn.sortedCharactors);
  if (doAction instanceof DataNotFoundError || doAction instanceof ReceiverDuplicationError) {
    return doAction;
  }

  if (!dialogue.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  const newBattle = spendTurn(battle, actor, doAction, getDate, getRandoms);

  await repository.save(newBattle);
  return newBattle;
};
