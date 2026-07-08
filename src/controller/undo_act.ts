import type { Battle } from "../model/battle";
import type { Repository } from "../repository";

import { undoTurn } from "../model/battle";
import { UserCancel, InvalidArgumentError } from "../model/error";

export type UndoAct = (
  repository: Repository,
) => (battle: Battle) => Promise<Battle | UserCancel | InvalidArgumentError>;
export const undoAct: UndoAct = (repository) => async (battle) => {
  const { battle: battleRepository, local } = repository;
  if (!local.confirm("直前の行動を取り消しますか？")) {
    return new UserCancel("取り消していません");
  }

  const newBattle = undoTurn(battle);
  if (newBattle instanceof InvalidArgumentError) {
    return newBattle;
  }
  await battleRepository.save(newBattle);
  return newBattle;
};
