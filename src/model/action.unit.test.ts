import { describe, it, expect } from "vitest";

import type { Action, Act, Filter } from "./action";
import type { Unit } from "./unit";
import type { GetPiece } from "./piece";
import {
  buildAction,
  effectBaseDamage,
  effectGrantStatus,
  effectHeal,
  effectOverHeal,
  filterActor,
  filterAlive,
  validateReceivers,
} from "./action";
import { ReceiverDuplicationError } from "./error";

const noopAct: Act = (_actor, _receiver, units) => units;
const noopFilter: Filter = (_actor, _units) => [];

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
  effectRange: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  reachRange: [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 2, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ],
};

// S7: act/filterはUnit[]を受け取る(Turn非依存)。テストもunits配列を直接渡す。
const buildUnits = (units: Unit[]): Unit[] => units;

// effectHeal用のgetPiece stub。MaxHPはking=2、それ以外=3。
const healGetPiece: GetPiece = (key) => ({
  key,
  name: key,
  shogiName: key,
  description: "",
  MaxHP: key === "king" ? 2 : 3,
  move: 3,
  actions: [],
});

describe("Action#effectBaseDamage", function () {
  it("receiverのhpをbaseDamage分減らす", function () {
    const units = buildUnits([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = effectBaseDamage(baseAction)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(2); // 対象外
    expect(result[1].hp).toBe(1); // 3 - 2
  });

  it("hpは0未満にならない", function () {
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 1, steps: 0, statuses: [] }]);

    const result = effectBaseDamage(baseAction)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(0);
  });

  it("元のunitsは変更されない(非破壊)", function () {
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] }]);

    effectBaseDamage(baseAction)({ side: "FIRST", piece: "king" }, [{ side: "SECOND", piece: "gold" }], units);

    expect(units[0].hp).toBe(3);
  });

  it("interceptionを持つreceiverは被ダメージが1減る", function () {
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: ["interception"] }]);

    const result = effectBaseDamage(baseAction)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(2); // 3 - (baseDamage2 - 1)
  });

  it("interceptionで軽減してもダメージは0未満にならない", function () {
    const oneDamage: Action = { ...baseAction, baseDamage: 1 };
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: ["interception"] }]);

    const result = effectBaseDamage(oneDamage)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(3); // 1 - 1 = 0ダメージ
  });

  it("arrowDodgeを持つreceiverは遠隔攻撃(reachLength>2)のダメージが0になる", function () {
    const ranged: Action = { ...baseAction, reachLength: 3 };
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: ["arrowDodge"] }]);

    const result = effectBaseDamage(ranged)(
      { side: "FIRST", piece: "rook" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(3); // 無効化
  });

  it("arrowDodgeを持っていても近接攻撃(reachLength<=2)は通常通りダメージを受ける", function () {
    const melee: Action = { ...baseAction, reachLength: 2 };
    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: ["arrowDodge"] }]);

    const result = effectBaseDamage(melee)(
      { side: "FIRST", piece: "king" },
      [{ side: "SECOND", piece: "gold" }],
      units,
    );

    expect(result[0].hp).toBe(1); // 3 - 2
  });
});

describe("Action#filterActor", function () {
  it("actorのunit_referenceのみ返す", function () {
    const units = buildUnits([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = filterActor(baseAction)({ side: "FIRST", piece: "king" }, units);

    expect(result).toEqual([{ side: "FIRST", piece: "king" }]);
  });
});

describe("Action#buildAction", function () {
  it("act/filterが構築したaction自身を参照して動く", function () {
    const action = buildAction(
      {
        key: "buildTest",
        name: "ビルドテスト",
        description: "",
        baseDamage: 3,
        receiverCount: 1,
        cost: 2,
        effectLength: 1,
        reachLength: 1,
        effectRange: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0],
        ],
        reachRange: [
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 1, 2, 1, 0, 0],
          [0, 0, 0, 1, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
          [0, 0, 0, 0, 0, 0, 0],
        ],
      },
      effectBaseDamage,
      filterActor,
    );

    const units = buildUnits([{ side: "SECOND", piece: "gold", hp: 5, steps: 0, statuses: [] }]);

    // actはaction.baseDamage(3)を参照する
    const acted = action.act({ side: "FIRST", piece: "king" }, [{ side: "SECOND", piece: "gold" }], units, () => null);
    expect(acted[0].hp).toBe(2); // 5 - 3

    // filterはfilterActor相当でactorのみ返す
    expect(action.filter({ side: "FIRST", piece: "king" }, units)).toEqual([{ side: "FIRST", piece: "king" }]);
  });
});

describe("Action#effectGrantStatus", function () {
  it("receiverのstatusesにstatus keyを付与する", function () {
    const units = buildUnits([
      { side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: [] },
      { side: "SECOND", piece: "silver", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      units,
    );

    expect(result[0].statuses).toEqual(["interception"]); // 付与された
    expect(result[1].statuses).toEqual([]); // 対象外
  });

  it("既に同じstatusを持つ場合は重複して付与しない", function () {
    const units = buildUnits([{ side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: ["interception"] }]);

    const result = effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      units,
    );

    expect(result[0].statuses).toEqual(["interception"]);
  });

  it("元のunitsは変更されない(非破壊)", function () {
    const units = buildUnits([{ side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: [] }]);

    effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      units,
    );

    expect(units[0].statuses).toEqual([]);
  });
});

describe("Action#effectHeal", function () {
  it("kingは上限2、それ以外は上限3まで回復する", function () {
    const units = buildUnits([
      { side: "FIRST", piece: "king", hp: 1, steps: 0, statuses: [] },
      { side: "FIRST", piece: "gold", hp: 1, steps: 0, statuses: [] },
    ]);

    const result = effectHeal(baseAction)(
      { side: "FIRST", piece: "pawn" },
      [
        { side: "FIRST", piece: "king" },
        { side: "FIRST", piece: "gold" },
      ],
      units,
      healGetPiece,
    );

    expect(result[0].hp).toBe(2); // king上限2
    expect(result[1].hp).toBe(3); // それ以外上限3
  });

  it("既に上限を超えている場合は減らさない", function () {
    const units = buildUnits([{ side: "FIRST", piece: "king", hp: 4, steps: 0, statuses: [] }]);

    const result = effectHeal(baseAction)(
      { side: "FIRST", piece: "pawn" },
      [{ side: "FIRST", piece: "king" }],
      units,
      healGetPiece,
    );

    expect(result[0].hp).toBe(4);
  });

  it("MaxHP=2の駒(promotedLance等)は2までしか回復しない(§2.4 旧healCapバグの回帰)", function () {
    const units = buildUnits([{ side: "FIRST", piece: "promotedLance", hp: 1, steps: 0, statuses: [] }]);
    const getPiece: GetPiece = (key) => ({
      key,
      name: key,
      shogiName: key,
      description: "",
      MaxHP: 2,
      move: 3,
      actions: [],
    });

    const result = effectHeal(baseAction)(
      { side: "FIRST", piece: "pawn" },
      [{ side: "FIRST", piece: "promotedLance" }],
      units,
      getPiece,
    );

    expect(result[0].hp).toBe(2); // 旧実装はking以外一律3で3まで回復していた
  });
});

describe("Action#effectOverHeal", function () {
  it("体力を1回復し、上限を超えて追加できる", function () {
    const units = buildUnits([{ side: "FIRST", piece: "promotedPawn", hp: 3, steps: 0, statuses: [] }]);

    const result = effectOverHeal(baseAction)(
      { side: "FIRST", piece: "promotedPawn" },
      [{ side: "FIRST", piece: "promotedPawn" }],
      units,
    );

    expect(result[0].hp).toBe(4); // 上限3を超える
  });
});

describe("Action#filterAlive", function () {
  it("hpが1以上のunitのunit_referenceを返す", function () {
    const units = buildUnits([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
      { side: "SECOND", piece: "gold", hp: 0, steps: 0, statuses: [] },
      { side: "SECOND", piece: "silver", hp: 1, steps: 0, statuses: [] },
    ]);

    const result = filterAlive(baseAction)({ side: "FIRST", piece: "king" }, units);

    expect(result).toEqual([
      { side: "FIRST", piece: "king" },
      { side: "SECOND", piece: "silver" },
    ]);
  });
});

describe("Action#validateReceivers", function () {
  it("重複が無ければnull", function () {
    const result = validateReceivers([
      { side: "FIRST", piece: "king" },
      { side: "SECOND", piece: "king" },
    ]);
    expect(result).toBeNull();
  });

  it("同一 side:piece が重複していればReceiverDuplicationError", function () {
    const result = validateReceivers([
      { side: "FIRST", piece: "king" },
      { side: "FIRST", piece: "king" },
    ]);
    expect(result).toBeInstanceOf(ReceiverDuplicationError);
  });
});
