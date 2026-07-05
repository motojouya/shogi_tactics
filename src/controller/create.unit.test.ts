import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { CreationForm } from "../form/creation";

import { describe, it, expect } from "vitest";

import { createBattle } from "./create";
import { pieceRepository } from "../repository/piece";
import { GameOngoing, NORMAL_STEP_BASE, NORMAL_UNIT_COUNT } from "../model/battle";

const battleRepository: BattleRepository = {
  save: async () => {},
  get: async () => null,
  remove: async () => {},
  list: async () => [],
  importJson: async () => null,
  exportJson: async () => null,
};

const local: Local = {
  confirm: () => true,
  notice: () => {},
  getUuid: () => "0191e000-0000-7000-8000-000000000000",
  now: () => new Date("2023-06-29T12:12:21"),
  transit: () => {},
  getSearchParams: () => new URLSearchParams(),
};

// createBattleは通常モードで固定編成(buildNormalUnits)まで行うためpieceを参照する。
const repository = { battle: battleRepository, local, piece: pieceRepository } as unknown as Repository;

describe("createBattle", () => {
  it("戦乱モードは空編成の先頭Turnで始まる(units空・入力のstepBase/unitCountを採用)", async () => {
    const form: CreationForm = {
      mode: "war",
      first_player_name: "first",
      second_player_name: "second",
      stepBase: 4,
      unitCount: 4,
    };
    const battle = await createBattle(repository)(form, "v1");

    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.first_player_name).toBe("first");
    expect(battle.second_player_name).toBe("second");
    expect(battle.stepBase).toBe(4);
    expect(battle.unitCount).toBe(4);
    expect(battle.version).toBe("v1");
    expect(battle.result).toBe(GameOngoing);
    // 戦乱モードは先頭FORMATION turnを空編成で持ち、以降addUnitで駒を追記する。
    expect(battle.turns.length).toBe(1);
    expect(battle.turns[0].units.length).toBe(0);
  });

  it("通常モードは固定編成まで行う(先頭Turn生成・stepBase/unitCountは既定値)", async () => {
    const form: CreationForm = {
      mode: "normal",
      first_player_name: "first",
      second_player_name: "second",
      stepBase: NORMAL_STEP_BASE,
      unitCount: NORMAL_UNIT_COUNT,
    };
    const battle = await createBattle(repository)(form, "v1");

    expect(battle.stepBase).toBe(NORMAL_STEP_BASE);
    expect(battle.unitCount).toBe(NORMAL_UNIT_COUNT);
    // 通常モードは編成まで済ませるので先頭Turnが積まれ、両陣営7駒(=14 unit)が並ぶ。
    expect(battle.turns.length).toBe(1);
    expect(battle.turns[0].units.length).toBe(NORMAL_UNIT_COUNT * 2);
  });
});
