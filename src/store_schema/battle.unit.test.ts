import { describe, it, expect } from "vitest";

import type { Battle } from "../model/battle";
import { toBattle } from "./battle";

const testData = {
  key: "0191e000-0000-7000-8000-000000000000",
  first_player_name: "light",
  second_player_name: "dark",
  stepBase: 4,
  unitCount: 2,
  version: "v1",
  turns: [
    {
      datetime: "2023-06-29T12:12:21",
      order: { type: "FORMATION" },
      units: [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
      ],
    },
    {
      datetime: "2023-06-29T12:12:23",
      order: {
        type: "DO_SKILL",
        actionKey: "meleeAttack",
        actor: { side: "FIRST", piece: "king" },
        receivers: [{ side: "SECOND", piece: "pawn" }],
      },
      units: [
        { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "FIRST", piece: "king", hp: 2, steps: 6, statuses: [], leader: true },
      ],
    },
  ],
  result: "ONGOING",
};

describe("Battle#toBattle", function () {
  it("toBattle", async () => {
    const battle = toBattle(testData) as Battle;
    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.first_player_name).toBe("light");
    expect(battle.second_player_name).toBe("dark");
    expect(battle.stepBase).toBe(4);
    expect(battle.unitCount).toBe(2);
    expect(battle.version).toBe("v1");
    expect(battle.turns.length).toBe(2);
    expect(battle.turns[0].order.type).toBe("FORMATION");
    expect(battle.turns[0].units.length).toBe(2);
    expect(battle.turns[1].order.type).toBe("DO_SKILL");
  });
});
