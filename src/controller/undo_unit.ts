import type { Battle } from "../model/battle";
import type { Repository } from "../repository";

import { undoFormationUnit } from "../model/battle";

// 編成中のrosterから最後に追加したunitを取り消して保存する。
export type UndoUnit = (repository: Repository) => (battle: Battle) => Promise<Battle>;
export const undoUnit: UndoUnit = (repository) => async (battle) => {
  const { battle: battleRepository } = repository;
  const newBattle = undoFormationUnit(battle);
  await battleRepository.save(newBattle);
  return newBattle;
};
