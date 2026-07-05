import type { Battle } from "../model/battle";
import type { Side } from "../model/unit";
import type { FormationForm } from "../form/formation";
import type { Repository } from "../repository";

import { addFormationUnit } from "../model/battle";

export type AddUnit = (repository: Repository) => (battle: Battle, side: Side, form: FormationForm) => Promise<Battle>;
export const addUnit: AddUnit = (repository) => async (battle, side, form) => {
  const { battle: battleRepository, piece: pieceRepository } = repository;
  const piece = pieceRepository.get(form.piece);
  if (!piece) {
    return battle;
  }

  const newBattle = addFormationUnit(battle, side, piece, form.leader);
  if (newBattle === battle) {
    return battle;
  }

  await battleRepository.save(newBattle);
  return newBattle;
};
