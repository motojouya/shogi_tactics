import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { DoActionForm } from "../form/action";
import type { Repository } from "../repository";

import { doNothing, doAct } from "../model/battle";
import { ORDER_DO_NOTHING } from "../model/turn";
import { toReceivers } from "../form/action";
import { createResolvers } from "../repository";
import { DataNotFoundError, UserCancel, ReceiverDuplicationError } from "../model/error";

export type Act = (
  repository: Repository,
) => (
  battle: Battle,
  actor: UnitReference,
  doActionForm: DoActionForm,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (repository) => async (battle, actor, doActionForm) => {
  const { battle: battleRepository, local } = repository;

  if (!local.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  if (doActionForm.actionKey === ORDER_DO_NOTHING) {
    const newBattle = doNothing(battle, actor, local.now());
    await battleRepository.save(newBattle);
    return newBattle;
  }

  const receivers = toReceivers(doActionForm.receivers);
  const result = doAct(battle, actor, doActionForm.actionKey, receivers, createResolvers(repository), local.now());
  if (result instanceof DataNotFoundError || result instanceof ReceiverDuplicationError) {
    return result;
  }

  await battleRepository.save(result);
  return result;
};
