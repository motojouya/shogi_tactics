import type { Battle } from "../model/battle";
import type { CreationForm } from "../form/creation";
import type { Repository } from "../repository";

import {
  createBattle as createBattleModel,
  format,
  formatNormal,
  NORMAL_MODE,
  NORMAL_STEP_BASE,
  NORMAL_UNIT_COUNT,
} from "../model/battle";

export type CreateBattle = (repository: Repository) => (form: CreationForm, version: string) => Promise<Battle>;
export const createBattle: CreateBattle = (repository) => async (form, version) => {
  const { battle: battleRepository, local, piece: pieceRepository } = repository;
  const isNormal = form.mode === NORMAL_MODE;

  // 通常モードは固定のstepBase/unitCountと固定編成、戦乱モードは入力値で空の編成から始める。
  const stepBase = isNormal ? NORMAL_STEP_BASE : form.stepBase;
  const unitCount = isNormal ? NORMAL_UNIT_COUNT : form.unitCount;
  const skeleton = createBattleModel(
    local.getUuid(),
    form.first_player_name,
    form.second_player_name,
    stepBase,
    unitCount,
    version,
  );

  // 先頭FORMATION turnを積む。通常モードは固定編成まで済ませ、戦乱モードは空編成(以降addUnitで追記)。
  const battle = isNormal
    ? formatNormal(skeleton, pieceRepository.get, local.now())
    : format(skeleton, [], local.now());

  await battleRepository.save(battle);
  return battle;
};
