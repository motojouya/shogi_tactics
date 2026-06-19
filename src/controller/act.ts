import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { BattleRepository } from "../repository/battle";
import type { DoActionForm } from "../form/action";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Resolvers } from "../model/resolver";

import { spendTurn } from "../model/battle";
import { toAction, ReceiverDuplicationError } from "../form/action";
import { DataNotFoundError, UserCancel } from "../repository/error";

export type Act = (
  local: Local,
  repository: BattleRepository,
  action: Repository["action"],
  resolvers: Resolvers,
) => (
  battle: Battle,
  actor: UnitReference,
  doActionForm: DoActionForm,
  getDate: () => Date,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (local, repository, action, resolvers) => async (battle, actor, doActionForm, getDate) => {
  const doAction = toAction(action)(doActionForm);
  if (doAction instanceof DataNotFoundError || doAction instanceof ReceiverDuplicationError) {
    return doAction;
  }

  if (!local.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  const newBattle = spendTurn(battle, actor, doAction, resolvers, getDate);

  await repository.save(newBattle);
  return newBattle;
};
