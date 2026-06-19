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
  battleSchema,
  GameOngoing,
  GameFirst,
  GameSecond,
  GameDraw,
  NORMAL_UNIT_COUNT,
  NORMAL_STEP_BASE,
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
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
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
        { side: "FIRST", piece: "a", hp: 1, steps: 5, statuses: [], leader: false },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [], leader: false },
        { side: "FIRST", piece: "c", hp: 1, steps: 2, statuses: [], leader: false },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b", "c", "a"]);
    expect(nextActor(turn)?.piece).toBe("b");
  });

  it("死亡駒(hp0)は除外する", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "a", hp: 0, steps: 1, statuses: [], leader: false },
        { side: "SECOND", piece: "b", hp: 1, steps: 2, statuses: [], leader: false },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    expect(sortedUnits(turn).map((unit) => unit.piece)).toEqual(["b"]);
  });
});

describe("Battle#spendTurn", function () {
  it("DO_ACTION: ダメージ適用・actorのsteps加算・steps昇順並べ替え", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    const result = spendTurn(
      battle,
      ref("FIRST", "king"),
      { action: attack, receivers: [ref("SECOND", "pawn")] },
      () => null,
      () => new Date(),
    );

    const last = getLastTurn(result);
    expect(last.order.type).toBe("DO_ACTION");

    const pawn = last.units.find((unit) => unit.piece === "pawn");
    const king = last.units.find((unit) => unit.piece === "king");
    expect(pawn?.hp).toBe(1); // 3 - 2
    expect(king?.steps).toBe(4); // 0 + stepBase2 + cost2
    expect(last.units[0].piece).toBe("pawn"); // steps0 < steps4
    expect(result.result).toBe(GameOngoing);
  });

  it("死亡駒は除外し、片側全滅で決着する", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [], leader: true },
    ]);
    const result = spendTurn(
      battle,
      ref("FIRST", "king"),
      { action: attack, receivers: [ref("SECOND", "pawn")] },
      () => null,
      () => new Date(),
    );

    const last = getLastTurn(result);
    expect(last.units.length).toBe(1);
    expect(last.units[0].piece).toBe("king");
    expect(result.result).toBe(GameFirst);
  });

  it("DO_NOTHING: 自分の持続statusをクリアしsteps加算(cost0)", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: ["interception"], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    const result = spendTurn(
      battle,
      ref("FIRST", "king"),
      null,
      () => null,
      () => new Date(),
    );

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
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    battle.turns.push(surrender(battle, ref("FIRST", "king"), new Date()));
    expect(getLastTurn(battle).order.type).toBe("SURRENDER");
    expect(isSettlement(battle)).toBe(GameSecond);
  });

  it("両側生存ならONGOING", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    expect(isSettlement(battle)).toBe(GameOngoing);
  });

  it("両側全滅ならDRAW", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 0, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 0, steps: 0, statuses: [], leader: true },
    ]);
    expect(isSettlement(battle)).toBe(GameDraw);
  });
});

// 保存型(=model)をそのまま検証/復元する。datetime文字列はz.coerce.date()でDate化される。
describe("Battle#battleSchema", function () {
  it("永続化されたjson形(datetimeは文字列)をparseしBattleに復元する", function () {
    const json = {
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
            type: "DO_ACTION",
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

    const battle = battleSchema.parse(json);
    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.turns.length).toBe(2);
    expect(battle.turns[0].datetime).toBeInstanceOf(Date);
    expect(battle.turns[0].order.type).toBe("FORMATION");
    expect(battle.turns[1].order.type).toBe("DO_ACTION");
    expect(battle.result).toBe(GameOngoing);
  });
});

describe("Battle#通常モード定数", function () {
  it("stepBase/unitCountの定数値", function () {
    expect(NORMAL_UNIT_COUNT).toBe(7);
    expect(NORMAL_STEP_BASE).toBe(14);
  });
});
