import { describe, it, expect } from "vitest";

import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";

import { createBattle, start, GameFirst, GameSecond } from "../model/battle";
import { surrender } from "./surrender";
import { UserCancel } from "../model/error";

const makeBattle = (): Battle => {
  const battle = createBattle("key", "first", "second", 2, 2, "v1");
  battle.turns.push(
    start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
      ],
      new Date("2024-01-01T00:00:00"),
    ),
  );
  return battle;
};

let saved: Battle | null = null;
const battleRepository: BattleRepository = {
  save: async (battle) => {
    saved = battle;
  },
  get: async () => null,
  remove: async () => {},
  list: async () => [],
  importJson: async () => null,
  exportJson: async () => null,
};

const local = (confirm: boolean): Local => ({
  confirm: () => confirm,
  notice: () => {},
  getUuid: () => "key",
  now: () => new Date("2024-01-01T00:00:00"),
  transit: () => {},
  getSearchParams: () => new URLSearchParams(),
});

// S16: controllerはRepositoryを丸ごと受け取る。surrenderはbattle/localのみ参照する。
const repository = (confirm: boolean) => ({ battle: battleRepository, local: local(confirm) }) as unknown as Repository;

describe("surrender", () => {
  it("first surrender", async () => {
    saved = null;
    const battle = makeBattle();
    const result = await surrender(repository(true))(battle, { side: "FIRST", piece: "king" }, new Date());
    expect(result).toBe(null);
    expect(saved?.result).toBe(GameSecond); // 先手が降参 → 後手の勝ち
  });

  it("second surrender", async () => {
    saved = null;
    const battle = makeBattle();
    const result = await surrender(repository(true))(battle, { side: "SECOND", piece: "pawn" }, new Date());
    expect(result).toBe(null);
    expect(saved?.result).toBe(GameFirst); // 後手が降参 → 先手の勝ち
  });

  it("cancel", async () => {
    saved = null;
    const battle = makeBattle();
    const result = await surrender(repository(false))(battle, { side: "FIRST", piece: "king" }, new Date());
    expect(result instanceof UserCancel).toBe(true);
    expect(saved).toBe(null);
  });
});
