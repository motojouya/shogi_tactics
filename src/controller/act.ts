import type { Battle } from "../model/battle";
import type { UnitReference } from "../model/unit";
import type { DoActionForm } from "../form/action";
import type { Repository } from "../repository";

import { doNothing, doAct } from "../model/battle";
import { ORDER_DO_NOTHING } from "../model/turn";
import { validateReceivers, ReceiverDuplicationError } from "../model/action";
import { toReceivers } from "../form/action";
import { createResolvers } from "../repository";
import { DataNotFoundError, UserCancel } from "../repository/error";

// step15(S13/S16): formからは値だけ受け取り、controllerが組み立てる。第1引数でRepositoryを丸ごと受け取る(§7.3)。
// step15: spendTurn分割に伴い、actionKeyのDO_NOTHING判定でdoNothing/doActを呼び分ける。
// - actionKey: ORDER_DO_NOTHINGならdoNothing(action不要)。それ以外はdoActへ。
// - receivers: formのtoReceiversでUnitReference[]へ解決。受け手重複検証はvalidateReceivers(model)。
// - action解決と存在チェックはdoAct内(resolvers.getAction)。日時はrepository(local.now)から取得し値で渡す。
export type Act = (
  repository: Repository,
) => (
  battle: Battle,
  actor: UnitReference,
  doActionForm: DoActionForm,
) => Promise<Battle | DataNotFoundError | ReceiverDuplicationError | UserCancel>;
export const act: Act = (repository) => async (battle, actor, doActionForm) => {
  const { battle: battleRepository, local } = repository;

  // 何もしない
  if (doActionForm.actionKey === ORDER_DO_NOTHING) {
    if (!local.confirm("実行していいですか？")) {
      return new UserCancel("Cancelされました");
    }
    const newBattle = doNothing(battle, actor, local.now());
    await battleRepository.save(newBattle);
    return newBattle;
  }

  // 技を実行
  const receivers = toReceivers(doActionForm.receivers);
  const duplication = validateReceivers(receivers);
  if (duplication) {
    return duplication;
  }

  if (!local.confirm("実行していいですか？")) {
    return new UserCancel("Cancelされました");
  }

  const result = doAct(battle, actor, doActionForm.actionKey, receivers, createResolvers(repository), local.now());
  if (result instanceof DataNotFoundError) {
    return result;
  }

  await battleRepository.save(result);
  return result;
};
