import { describe, it, expect } from "vitest";

import type { Action, Act, Filter } from "./action";
import type { Unit } from "./unit";
import type { Turn } from "./turn";
import {
  buildAction,
  effectBaseDamage,
  effectGrantStatus,
  effectHeal,
  effectOverHeal,
  filterActor,
  filterAlive,
} from "./action";

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
      },
      effectBaseDamage,
      filterActor,
    );

    const turn = buildTurn([{ side: "SECOND", piece: "gold", hp: 5, steps: 0, statuses: [] }]);

    // actはaction.baseDamage(3)を参照する
    const acted = action.act({ side: "FIRST", piece: "king" }, [{ side: "SECOND", piece: "gold" }], turn);
    expect(acted.units[0].hp).toBe(2); // 5 - 3

    // filterはfilterActor相当でactorのみ返す
    expect(action.filter({ side: "FIRST", piece: "king" }, turn)).toEqual([{ side: "FIRST", piece: "king" }]);
  });
});

describe("Action#effectGrantStatus", function () {
  it("receiverのstatusesにstatus keyを付与する", function () {
    const turn = buildTurn([
      { side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: [] },
      { side: "SECOND", piece: "silver", hp: 3, steps: 0, statuses: [] },
    ]);

    const result = effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      turn,
    );

    expect(result.units[0].statuses).toEqual(["interception"]); // 付与された
    expect(result.units[1].statuses).toEqual([]); // 対象外
  });

  it("既に同じstatusを持つ場合は重複して付与しない", function () {
    const turn = buildTurn([{ side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: ["interception"] }]);

    const result = effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      turn,
    );

    expect(result.units[0].statuses).toEqual(["interception"]);
  });

  it("元のTurnは変更されない(clone)", function () {
    const turn = buildTurn([{ side: "FIRST", piece: "gold", hp: 3, steps: 0, statuses: [] }]);

    effectGrantStatus("interception")(baseAction)(
      { side: "FIRST", piece: "gold" },
      [{ side: "FIRST", piece: "gold" }],
      turn,
    );

    expect(turn.units[0].statuses).toEqual([]);
  });
});

describe("Action#effectHeal", function () {
  it("kingは上限2、それ以外は上限3まで回復する", function () {
    const turn = buildTurn([
      { side: "FIRST", piece: "king", hp: 1, steps: 0, statuses: [] },
      { side: "FIRST", piece: "gold", hp: 1, steps: 0, statuses: [] },
    ]);

    const result = effectHeal(baseAction)(
      { side: "FIRST", piece: "pawn" },
      [
        { side: "FIRST", piece: "king" },
        { side: "FIRST", piece: "gold" },
      ],
      turn,
    );

    expect(result.units[0].hp).toBe(2); // king上限2
    expect(result.units[1].hp).toBe(3); // それ以外上限3
  });

  it("既に上限を超えている場合は減らさない", function () {
    const turn = buildTurn([{ side: "FIRST", piece: "king", hp: 4, steps: 0, statuses: [] }]);

    const result = effectHeal(baseAction)({ side: "FIRST", piece: "pawn" }, [{ side: "FIRST", piece: "king" }], turn);

    expect(result.units[0].hp).toBe(4);
  });
});

describe("Action#effectOverHeal", function () {
  it("体力を1回復し、上限を超えて追加できる", function () {
    const turn = buildTurn([{ side: "FIRST", piece: "promotedPawn", hp: 3, steps: 0, statuses: [] }]);

    const result = effectOverHeal(baseAction)(
      { side: "FIRST", piece: "promotedPawn" },
      [{ side: "FIRST", piece: "promotedPawn" }],
      turn,
    );

    expect(result.units[0].hp).toBe(4); // 上限3を超える
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
