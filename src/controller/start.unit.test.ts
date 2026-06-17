import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";

import { describe, it, expect } from "vitest";

import type { Unit } from "../model/unit";

import { registerBattle, startBattle } from "./start";
import { GameOngoing } from "../model/battle";

// registerBattle/startBattleはget/importJsonを呼ばないので、それらはnull固定のスタブで十分。
const battleRepository: BattleRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(null)),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(null)),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

const local: Local = {
  confirm: (_message) => true,
  notice: (_message) => {},
  getUuid: () => "0191e000-0000-7000-8000-000000000000",
  now: () => new Date("2023-06-29T12:12:21"),
};

const units: Unit[] = [
  { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
  { side: "SECOND", piece: "pawn", hp: 1, steps: 0, statuses: [], leader: true },
];

describe("registerBattle", () => {
  it("register battle", async () => {
    const battle = await registerBattle(battleRepository, local)("first", "second", 4, 4, "v1");

    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.first_player_name).toBe("first");
    expect(battle.second_player_name).toBe("second");
    expect(battle.stepBase).toBe(4);
    expect(battle.unitCount).toBe(4);
    expect(battle.version).toBe("v1");
    expect(battle.result).toBe(GameOngoing);
    // step6: 登録時点は編成段階。turnsは空(units未選択)。
    expect(battle.turns.length).toBe(0);
  });
});

describe("startBattle", () => {
  it("start battle", async () => {
    const registered = await registerBattle(battleRepository, local)("first", "second", 4, 4, "v1");
    const battle = await startBattle(battleRepository, local)(registered, units);

    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.first_player_name).toBe("first");
    expect(battle.second_player_name).toBe("second");
    // step6: 編成確定で先頭Turn(units入り)が1つ積まれる。
    expect(battle.turns.length).toBe(1);
    expect(battle.turns[0].units.length).toBe(2);
    expect(battle.turns[0].units[0].piece).toBe("king");
  });
});
