import type { Battle } from "../model/battle";
import type { Unit } from "../model/unit";
import type { Repository } from "../repository";

import { copyBattle, createBattle, start } from "../model/battle";

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

export type StartBattle = (repository: Repository) => (battle: Battle, units: Unit[]) => Promise<Battle>;
export const startBattle: StartBattle = (repository) => async (battle, units) => {
  const { battle: battleRepository, local } = repository;
  const newBattle = copyBattle(battle);
  newBattle.turns.push(start(units, local.now()));

  await battleRepository.save(newBattle);

  return newBattle;
};
