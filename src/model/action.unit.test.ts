import { describe, it, expect } from "vitest";

import type { Action, Act, Filter } from "./action";
import type { Unit } from "./unit";
import type { Turn } from "./turn";
import { effectBaseDamage, filterActor, filterAlive } from "./action";

const noopAct: Act = (_actor, _receiver, turn) => turn;
const noopFilter: Filter = (_actor, _turn) => [];

const baseAction: Action = {
  key: "test",
  name: "テスト",
  description: "",
  act: noopAct,
  filter: noopFilter,
  baseDamage: 2,
  receiverCount: 1,
  cost: 2,
  effectLength: 1,
  reachLength: 1,
};

const buildTurn = (units: Unit[]): Turn => ({
  datetime: new Date("2024-01-01T00:00:00"),
  action: { type: "TIME_PASSING", wt: 0 },
  sortedCharactors: [],
  units,
});

describe("Action#effectBaseDamage", function () {
  it("receiverのhpをbaseDamage分減らす", function () {
    const turn = buildTurn([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = effectBaseDamage(baseAction)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      turn,
    );

    expect(result.units[0].hp).toBe(2); // 対象外
    expect(result.units[1].hp).toBe(1); // 3 - 2
  });

  it("hpは0未満にならない", function () {
    const turn = buildTurn([{ side: "SECOND", piece: "gold", hp: 1, steps: 0, statuses: [] }]);

    const result = effectBaseDamage(baseAction)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      turn,
    );

    expect(result.units[0].hp).toBe(0);
  });

  it("元のTurnは変更されない(clone)", function () {
    const turn = buildTurn([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] }]);

    effectBaseDamage(baseAction)({ side: "FIRST", piece: "king" }, [{ side: "SECOND", piece: "gold" }], turn);

    expect(turn.units[0].hp).toBe(3);
  });
});

describe("Action#filterActor", function () {
  it("actorのunit_referenceのみ返す", function () {
    const turn = buildTurn([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = filterActor(baseAction)({ side: "FIRST", piece: "king" }, turn);

    expect(result).toEqual([{ side: "FIRST", piece: "king" }]);
  });
});

describe("Action#filterAlive", function () {
  it("hpが1以上のunitのunit_referenceを返す", function () {
    const turn = buildTurn([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 0, steps: 0, statuses: [] },
      { side: "SECOND", piece: "silver", hp: 1, steps: 0, statuses: [] },
    ]);

    const result = filterAlive(baseAction)({ side: "FIRST", piece: "king" }, turn);

    expect(result).toEqual([
      { side: "FIRST", piece: "king" },
      { side: "SECOND", piece: "silver" },
    ]);
  });
});
