import type { Battle } from "../model/battle";
import type { CreationForm } from "../form/creation";
import type { Repository } from "../repository";

import {
  createBattle as createBattleModel,
  formatNormal,
  NORMAL_MODE,
  NORMAL_STEP_BASE,
  NORMAL_UNIT_COUNT,
} from "../model/battle";
import { DataExistError } from "../model/error";

export type CreateBattle = (
  repository: Repository,
) => (form: CreationForm, version: string) => Promise<Battle | DataExistError>;
export const createBattle: CreateBattle = (repository) => async (form, version) => {
  const { battle: battleRepository, local, piece: pieceRepository } = repository;

  if (form.mode === NORMAL_MODE) {
    const skeleton = createBattleModel(
      local.getUuid(),
      form.first_player_name,
      form.second_player_name,
      NORMAL_STEP_BASE,
      NORMAL_UNIT_COUNT,
      version,
    );
    const battle = formatNormal(skeleton, pieceRepository.get, local.now());
    if (battle instanceof DataExistError) {
      return battle;
    }
    await battleRepository.save(battle);
    return battle;
  }

  const battle = createBattleModel(
    local.getUuid(),
    form.first_player_name,
    form.second_player_name,
    form.stepBase,
    form.unitCount,
    version,
  );
  await battleRepository.save(battle);
  return battle;
};
