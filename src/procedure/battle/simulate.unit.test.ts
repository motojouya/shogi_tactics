import { describe, it, expect } from "vitest";

import { start } from "../../model/battle";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";
import { simulate } from "./simulate";

const zeros7 = Array.from({ length: 7 }, () => [0, 0, 0, 0, 0, 0, 0]);

const attack = buildAction(
  {
    key: "atk",
    name: "攻撃",
    description: "",
    baseDamage: 2,
    receiverCount: 1,
    cost: 2,
    effectLength: 1,
    reachLength: 1,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: zeros7,
  },
  effectBaseDamage,
  filterAlive,
);

const actor = { side: "FIRST", piece: "king" } as const;

describe("simulate", () => {
  it("simulate", () => {
    const turn = start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    const result = simulate(attack, actor, { side: "SECOND", piece: "pawn" }, turn);
    expect(result.survive).toBe(true);
    expect(result.unit?.hp).toBe(1); // 3 - 2
  });

  it("simulate not survive", () => {
    const turn = start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
        { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [] },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    const result = simulate(attack, actor, { side: "SECOND", piece: "pawn" }, turn);
    expect(result.survive).toBe(false);
    expect(result.unit?.hp).toBe(0); // 2 - 2
  });
});
