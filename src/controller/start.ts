import type { Battle } from "../model/battle";
import type { Unit } from "../model/unit";
import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";

import { copyBattle, createBattle, start } from "../model/battle";

// step6: battle登録は2段階。
// 1) registerBattle: player名/stepBase/unitCount/versionを受け取り、編成前の骨格(turns=[])を保存する。
//    keyと日時はdialogue(provider)経由。unitsはこの時点では未選択(turns.length===0=編成段階)。
export type RegisterBattle = (
  battleRepository: BattleRepository,
  dialogue: Local,
) => (
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
  version: string,
) => Promise<Battle>;
export const registerBattle: RegisterBattle =
  (battleRepository, dialogue) => async (firstPlayerName, secondPlayerName, stepBase, unitCount, version) => {
    const battle = createBattle(dialogue.getUuid(), firstPlayerName, secondPlayerName, stepBase, unitCount, version);
    await battleRepository.save(battle);
    return battle;
  };

// 2) startBattle: 編成画面で選んだunitsで先頭Turnを積み、戦闘を開始する(同keyへ上書き保存)。
export type StartBattle = (
  battleRepository: BattleRepository,
  dialogue: Local,
) => (battle: Battle, units: Unit[]) => Promise<Battle>;
export const startBattle: StartBattle = (battleRepository, dialogue) => async (battle, units) => {
  const newBattle = copyBattle(battle);
  newBattle.turns.push(start(units, dialogue.now()));

  await battleRepository.save(newBattle);

  return newBattle;
};
