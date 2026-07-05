import type { BattleRepository } from "../repository/battle";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";
import type { Unit } from "../model/unit";

import { describe, it, expect } from "vitest";

import { undoUnit } from "./undo_unit";
import { createBattle, format } from "../model/battle";

const unit = (piece: string): Unit => ({
  side: "FIRST",
  piece,
  hp: 1,
  steps: 0,
  statuses: [],
  leader: false,
});

// 2駒を編成済みの先頭Turnを持つbattle。
const battleWith = (units: Unit[]): Battle =>
  format(createBattle("key", "first", "second", 4, 2, "v1"), units, new Date("2023-06-29T12:12:21"));

const buildRepository = (saved: Battle[]): Repository => {
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
  return { battle: battleRepository } as unknown as Repository;
};

describe("undoUnit", () => {
  it("最後に追加したunitを取り消して保存する", async () => {
    const saved: Battle[] = [];
    const result = await undoUnit(buildRepository(saved))(battleWith([unit("king"), unit("rook")]));

    expect(result.turns[0].units.map((u) => u.piece)).toEqual(["king"]);
    expect(saved.length).toBe(1);
  });
});
