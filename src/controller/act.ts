import type { Battle, DoActionInput } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { BattleRepository } from "../repository/battle";
import type { DoActionForm } from "../form/action";
import type { Local } from "../repository/local";
import type { Resolvers } from "../model/resolver";

import { spendTurn } from "../model/battle";
import { ORDER_DO_NOTHING } from "../model/turn";
import { validateReceivers, ReceiverDuplicationError } from "../model/action";
import { toReceivers } from "../form/action";
import { DataNotFoundError, UserCancel } from "../repository/error";

// step15(S13): formからは値だけ受け取り、controllerが組み立てる。
// - actionKey: modelがそのまま扱える値なのでform関数を介さず直接読む。ORDER_DO_NOTHINGならdoAction=null。
// - receivers: formのtoReceiversでUnitReference[]へ解決。
// - 受け手重複検証(validateReceivers)とaction解決(resolvers.getAction)はcontrollerの責務。
export type Act = (
  local: Local,
  repository: BattleRepository,
  resolvers: Resolvers,
) => (
  battle: Battle,
  actor: UnitReference,
  doActionForm: DoActionForm,
  getDate: () => Date,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (local, repository, resolvers) => async (battle, actor, doActionForm, getDate) => {
  let doAction: DoActionInput | null = null;
  if (doActionForm.actionKey !== ORDER_DO_NOTHING) {
    const receivers = toReceivers(doActionForm.receivers);

    const duplication = validateReceivers(receivers);
    if (duplication) {
      return duplication;
    }

    const action = resolvers.getAction(doActionForm.actionKey);
    if (!action) {
      return new DataNotFoundError(
        doActionForm.actionKey,
        "action",
        `${doActionForm.actionKey}というactionは存在しません`,
      );
    }

    doAction = { action, receivers };
  }

  if (!local.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  const newBattle = spendTurn(battle, actor, doAction, resolvers, getDate);

  await repository.save(newBattle);
  return newBattle;
};
