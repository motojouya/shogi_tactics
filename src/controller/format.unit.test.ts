import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Unit } from "../model/unit";

import { describe, it, expect } from "vitest";

import { formatBattle } from "./format";
import { createBattle, start } from "../model/battle";
import { DataExistError } from "../model/error";

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

const repository = { battle: battleRepository, local } as unknown as Repository;

const units: Unit[] = [
  { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
  { side: "SECOND", piece: "pawn", hp: 1, steps: 0, statuses: [], leader: true },
];

describe("formatBattle", () => {
  it("編成中のbattleに先頭Turnを積んで対戦を開始する", async () => {
    const battle = createBattle("key", "first", "second", 4, 4, "v1");
    const result = await formatBattle(repository)(battle, units);

    if (result instanceof DataExistError) {
      expect.unreachable("formatBattle should succeed");
    } else {
      expect(result.turns.length).toBe(1);
      expect(result.turns[0].units.length).toBe(2);
      expect(result.turns[0].units[0].piece).toBe("king");
    }
  });

  it("既に開始済み(turnsあり)ならDataExistErrorを返す", async () => {
    const battle = createBattle("key", "first", "second", 4, 4, "v1");
    battle.turns.push(start(units, new Date("2024-01-01T00:00:00")));
    const result = await formatBattle(repository)(battle, units);
    expect(result instanceof DataExistError).toBe(true);
  });
});
