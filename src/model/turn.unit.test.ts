import { describe, it, expect } from "vitest";

import type { Turn } from "./turn";

import { copyOrder, copyTurn, start, getFormationUnits, sortedUnits, nextActor } from "./turn";

describe("Turn#start", function () {
  it("編成unitsから先頭TurnをFORMATIONで生成する(unitsはコピー)", function () {
    const source = [
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true } as const,
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true } as const,
    ];
    const turn = start([...source], new Date("2024-01-01T00:00:00"));
    expect(turn.order.type).toBe("FORMATION");
    expect(turn.previous).toBe(0);
    expect(turn.units.length).toBe(2);
    expect(turn.units[0]).not.toBe(source[0]); // copyUnitで複製されている
  });
});

describe("Turn#getFormationUnits", function () {
  it("orderがFORMATIONのturnのunitsを返す", function () {
    const turns: Turn[] = [
      start(
        [{ side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true }],
        new Date("2024-01-01T00:00:00"),
      ),
      {
        datetime: new Date("2024-01-01T00:01:00"),
        previous: 0,
        order: { type: "DO_NOTHING", actor: { side: "FIRST", piece: "king" } },
        units: [{ side: "FIRST", piece: "king", hp: 2, steps: 4, statuses: [], leader: true }],
      },
    ];
    expect(getFormationUnits(turns).map((unit) => unit.piece)).toEqual(["king"]);
    expect(getFormationUnits(turns)[0].steps).toBe(0); // FORMATION turnのunits(steps0)を拾う
  });

  it("FORMATION turnが無ければ空配列", function () {
    expect(getFormationUnits([])).toEqual([]);
  });
});

describe("Turn#sortedUnits / nextActor", function () {
  it("steps昇順に並び、同点はindex(初期順)を保つ", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "a", hp: 1, steps: 5, statuses: [], leader: false },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [], leader: false },
        { side: "FIRST", piece: "c", hp: 1, steps: 2, statuses: [], leader: false },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b", "c", "a"]);
    expect(nextActor(turn)?.piece).toBe("b");
  });

  it("死亡駒(hp0)は行動順から除外する", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "a", hp: 0, steps: 1, statuses: [], leader: false },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [], leader: false },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b"]);
  });

  it("生存駒が居なければnextActorはnull", function () {
    const turn = start(
      [{ side: "FIRST", piece: "a", hp: 0, steps: 1, statuses: [], leader: false }],
      new Date("2024-01-01T00:00:00"),
    );
    expect(nextActor(turn)).toBeNull();
  });
});

describe("Turn#copyOrder", function () {
  it("DO_ACTIONのactor/receiversを別インスタンスで複製する", function () {
    const order = {
      type: "DO_ACTION",
      actionKey: "atk",
      actor: { side: "FIRST", piece: "king" },
      receivers: [{ side: "SECOND", piece: "pawn" }],
    } as const;
    const copied = copyOrder(order);
    expect(copied).toEqual(order);
    if (copied.type !== "DO_ACTION") {
      expect.unreachable("type mismatch");
      return;
    }
    expect(copied.actor).not.toBe(order.actor);
    expect(copied.receivers[0]).not.toBe(order.receivers[0]);
  });

  it("FORMATIONはtypeのみ複製する", function () {
    expect(copyOrder({ type: "FORMATION" })).toEqual({ type: "FORMATION" });
  });
});

describe("Turn#copyTurn", function () {
  it("datetime/order/unitsを別インスタンスで複製する", function () {
    const turn = start(
      [{ side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: ["a"], leader: true }],
      new Date("2024-01-01T00:00:00"),
    );
    const copied = copyTurn(turn);
    expect(copied).toEqual(turn);
    expect(copied.datetime).not.toBe(turn.datetime);
    expect(copied.units[0]).not.toBe(turn.units[0]);
    expect(copied.units[0].statuses).not.toBe(turn.units[0].statuses);
  });
});
