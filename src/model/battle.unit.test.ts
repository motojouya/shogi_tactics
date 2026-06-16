import { describe, it, expect } from "vitest";

import type { Unit, UnitReference } from "./unit";
import type { Battle } from "./battle";

import {
  createBattle,
  start,
  spendTurn,
  surrender,
  isSettlement,
  nextActor,
  sortedUnits,
  getLastTurn,
  GameOngoing,
  GameFirst,
  GameSecond,
  GameDraw,
} from "./battle";
import { buildAction, effectBaseDamage, filterAlive } from "./action";

const zeros7 = Array.from({ length: 7 }, () => [0, 0, 0, 0, 0, 0, 0]);

// 攻撃2/コスト2のテスト用Action。
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

const makeBattle = (units: Unit[], stepBase = 2): Battle => {
  const battle = createBattle("key", "first", "second", stepBase, units.length, "v1");
  battle.turns.push(start(units, new Date("2024-01-01T00:00:00")));
  return battle;
};

const ref = (side: "FIRST" | "SECOND", piece: string): UnitReference => ({ side, piece });

describe("Battle#createBattle", function () {
  it("骨格(turns=[])を生成する", function () {
    const battle = createBattle("key", "first", "second", 4, 2, "v1");
    expect(battle.turns.length).toBe(0);
    expect(battle.result).toBe(GameOngoing);
    expect(battle.stepBase).toBe(4);
    expect(battle.unitCount).toBe(2);
  });
});

describe("Battle#start", function () {
  it("編成unitsから先頭TurnをFORMATIONで生成する", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(turn.order.type).toBe("FORMATION");
    expect(turn.units.length).toBe(2);
  });
});

describe("Battle#sortedUnits / nextActor", function () {
  it("steps昇順、同点はindex(初期順)で並ぶ", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "a", hp: 1, steps: 5, statuses: [] },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [] },
        { side: "FIRST", piece: "c", hp: 1, steps: 2, statuses: [] },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b", "c", "a"]);
    expect(nextActor(turn)?.piece).toBe("b");
  });

  it("死亡駒(hp0)は除外する", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "a", hp: 0, steps: 1, statuses: [] },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [] },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b"]);
  });
});

describe("Battle#spendTurn", function () {
  it("DO_SKILL: ダメージ適用・actorのsteps加算・steps昇順並べ替え", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
    ]);
    const result = spendTurn(
      battle,
      ref("FIRST", "king"),
      { action: attack, receivers: [ref("SECOND", "pawn")] },
      () => new Date(),
    );

    const last = getLastTurn(result);
    expect(last.order.type).toBe("DO_SKILL");

    const pawn = last.units.find((unit) => unit.piece === "pawn");
    const king = last.units.find((unit) => unit.piece === "king");
    expect(pawn?.hp).toBe(1); // 3 - 2
    expect(king?.steps).toBe(4); // 0 + stepBase2 + cost2
    expect(last.units[0].piece).toBe("pawn"); // steps0 < steps4
    expect(result.result).toBe(GameOngoing);
  });

  it("死亡駒は除外し、片側全滅で決着する", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [] },
    ]);
    const result = spendTurn(
      battle,
      ref("FIRST", "king"),
      { action: attack, receivers: [ref("SECOND", "pawn")] },
      () => new Date(),
    );

    const last = getLastTurn(result);
    expect(last.units.length).toBe(1);
    expect(last.units[0].piece).toBe("king");
    expect(result.result).toBe(GameFirst);
  });

  it("DO_NOTHING: 自分の持続statusをクリアしsteps加算(cost0)", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: ["interception"] },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
    ]);
    const result = spendTurn(battle, ref("FIRST", "king"), null, () => new Date());

    const last = getLastTurn(result);
    expect(last.order.type).toBe("DO_NOTHING");
    const king = last.units.find((unit) => unit.piece === "king");
    expect(king?.statuses).toEqual([]); // 自分の行動で失効
    expect(king?.steps).toBe(2); // 0 + stepBase2 + cost0
  });
});

describe("Battle#surrender / isSettlement", function () {
  it("surrenderしたsideが負ける", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
    ]);
    battle.turns.push(surrender(battle, ref("FIRST", "king"), new Date()));
    expect(getLastTurn(battle).order.type).toBe("SURRENDER");
    expect(isSettlement(battle)).toBe(GameSecond);
  });

  it("両側生存ならONGOING", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
    ]);
    expect(isSettlement(battle)).toBe(GameOngoing);
  });

  it("両側全滅ならDRAW", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 0, steps: 0, statuses: [] },
      { side: "SECOND", piece: "pawn", hp: 0, steps: 0, statuses: [] },
    ]);
    expect(isSettlement(battle)).toBe(GameDraw);
  });
});
