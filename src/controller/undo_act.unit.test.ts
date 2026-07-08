import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";

import { describe, it, expect } from "vitest";

import { undoAct } from "./undo_act";
import { createBattle, doNothing } from "../model/battle";
import { start } from "../model/turn";
import { UserCancel, InvalidArgumentError } from "../model/error";

const makeBattle = (): Battle => {
  const created = createBattle("key", "first", "second", 2, 1, "v1");
  if (created instanceof InvalidArgumentError) {
    throw created;
  }
  const battle = created;
  battle.turns.push(
    start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 2, statuses: [], leader: true },
      ],
      new Date("2024-01-01T00:00:00"),
    ),
  );
  return battle;
};

// 1手(DO_NOTHING)進めた対戦。
const actedBattle = (): Battle => {
  const result = doNothing(makeBattle(), { side: "FIRST", piece: "king" }, new Date("2024-01-01T00:01:00"));
  if (result instanceof InvalidArgumentError) {
    throw result;
  }
  return result;
};

const buildRepository = (saved: Battle[], confirm: boolean): Repository => {
  const battleRepository: BattleRepository = {
    save: async (battle) => {
      saved.push(battle);
    },
    get: async () => null,
    remove: async () => {},
    list: async () => [],
    importJson: async () => null,
    exportJson: async () => null,
  };
  const local: Local = {
    confirm: () => confirm,
    notice: () => {},
    getUuid: () => "key",
    now: () => new Date("2024-01-01T00:02:00"),
    transit: () => {},
    getSearchParams: () => new URLSearchParams(),
  };
  return { battle: battleRepository, local } as unknown as Repository;
};

describe("undoAct", () => {
  it("確認後、直前の行動を取り消して保存する", async () => {
    const saved: Battle[] = [];
    const result = await undoAct(buildRepository(saved, true))(actedBattle());

    if (result instanceof UserCancel || result instanceof InvalidArgumentError) {
      expect.unreachable("undoAct should succeed");
      return;
    }
    expect(result.turns.length).toBe(1);
    expect(saved.length).toBe(1);
  });

  it("cancelするとUserCancelを返し保存しない", async () => {
    const saved: Battle[] = [];
    const result = await undoAct(buildRepository(saved, false))(actedBattle());

    expect(result).toBeInstanceOf(UserCancel);
    expect(saved.length).toBe(0);
  });

  it("編成turnしかない場合はInvalidArgumentErrorを返し保存しない", async () => {
    const saved: Battle[] = [];
    const result = await undoAct(buildRepository(saved, true))(makeBattle());

    expect(result).toBeInstanceOf(InvalidArgumentError);
    expect(saved.length).toBe(0);
  });
});
