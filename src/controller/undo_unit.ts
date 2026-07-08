import type { Battle } from "../model/battle";
import type { Repository } from "../repository";

import { undoFormationUnit } from "../model/battle";
import { InvalidArgumentError } from "../model/error";

export type UndoUnit = (repository: Repository) => (battle: Battle) => Promise<Battle | InvalidArgumentError>;
export const undoUnit: UndoUnit = (repository) => async (battle) => {
  const { battle: battleRepository } = repository;
  const newBattle = undoFormationUnit(battle);
  if (newBattle instanceof InvalidArgumentError) {
    return newBattle;
  }
  await battleRepository.save(newBattle);
  return newBattle;
};
