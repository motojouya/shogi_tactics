import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { BattleRepository } from "../repository/battle";
import type { DoActionForm } from "../form/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";

import { spendTurn } from "../model/battle";
import { toAction, ReceiverDuplicationError } from "../form/battle";
import { DataNotFoundError, UserCancel } from "../repository/error";

export type Act = (
  dialogue: Local,
  repository: BattleRepository,
  action: Repository["action"],
) => (
  battle: Battle,
  actor: UnitReference,
  doActionForm: DoActionForm,
  getDate: () => Date,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (dialogue, repository, action) => async (battle, actor, doActionForm, getDate) => {
  const doAction = toAction(action)(doActionForm);
  if (doAction instanceof DataNotFoundError || doAction instanceof ReceiverDuplicationError) {
    return doAction;
  }

  if (!dialogue.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  const newBattle = spendTurn(battle, actor, doAction, getDate);

  await repository.save(newBattle);
  return newBattle;
};
