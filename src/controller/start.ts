import type { Battle } from "../model/battle";
import type { Unit } from "../model/unit";
import type { Repository } from "../repository";

import { copyBattle, createBattle, start } from "../model/battle";

// step6: battle登録は2段階。
// 1) registerBattle: player名/stepBase/unitCount/versionを受け取り、編成前の骨格(turns=[])を保存する。
//    keyと日時はlocal(provider)経由。unitsはこの時点では未選択(turns.length===0=編成段階)。
// step15(S16/§7.3): controllerは第1引数でRepositoryを丸ごと受け取る。
export type RegisterBattle = (
  repository: Repository,
) => (
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
  version: string,
) => Promise<Battle>;
export const registerBattle: RegisterBattle =
  (repository) => async (firstPlayerName, secondPlayerName, stepBase, unitCount, version) => {
    const { battle: battleRepository, local } = repository;
    const battle = createBattle(local.getUuid(), firstPlayerName, secondPlayerName, stepBase, unitCount, version);
    await battleRepository.save(battle);
    return battle;
  };

// 2) startBattle: 編成画面で選んだunitsで先頭Turnを積み、戦闘を開始する(同keyへ上書き保存)。
export type StartBattle = (repository: Repository) => (battle: Battle, units: Unit[]) => Promise<Battle>;
export const startBattle: StartBattle = (repository) => async (battle, units) => {
  const { battle: battleRepository, local } = repository;
  const newBattle = copyBattle(battle);
  newBattle.turns.push(start(units, local.now()));

  await battleRepository.save(newBattle);

  return newBattle;
};
