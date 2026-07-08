import { describe, it, expect } from "vitest";

import type { Unit, UnitReference, Side } from "./unit";
import type { Piece } from "./piece";
import type { Battle } from "./battle";

import {
  createBattle,
  doNothing,
  doAct,
  surrender,
  surrenderBattle,
  isSettlement,
  sortedUnits,
  getLastTurn,
  getFormationUnits,
  format,
  formatNormal,
  addFormationUnit,
  undoFormationUnit,
  simulate,
  battleSchema,
  GameOngoing,
  GameFirst,
  GameSecond,
  GameDraw,
  validateBattleArgs,
  NORMAL_UNIT_COUNT,
  NORMAL_STEP_BASE,
} from "./battle";
import { start } from "./turn";
import { buildAction, effectBaseDamage, filterAlive } from "./action";
import { InvalidArgumentError, DataNotFoundError } from "./error";

// createBattleはBattle | InvalidArgumentErrorを返す。正常入力を前提とするテスト向けにBattleへ絞り込む。
const mustCreate = (
  key: string,
  first: string,
  second: string,
  stepBase: number,
  unitCount: number,
  version: string,
): Battle => {
  const battle = createBattle(key, first, second, stepBase, unitCount, version);
  if (battle instanceof InvalidArgumentError) {
    throw battle;
  }
  return battle;
};

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
  const battle = mustCreate("key", "first", "second", stepBase, units.length, "v1");
  battle.turns.push(start(units, new Date("2024-01-01T00:00:00")));
  return battle;
};

const ref = (side: "FIRST" | "SECOND", piece: string): UnitReference => ({ side, piece });

const mkPiece = (key: string, maxHP = 3): Piece => ({
  key,
  name: key,
  shogiName: key,
  description: "",
  MaxHP: maxHP,
  move: 3,
  actions: [],
});

// doActはresolvers.getActionでactionを解決し、getPieceでreceiverのpieceの存在を検証する。
const resolvers = {
  getAction: (key: string) => (key === "atk" ? attack : null),
  getPiece: (key: string) => mkPiece(key),
  getStatus: () => null,
};

describe("Battle#createBattle", function () {
  it("骨格(turns=[])を生成する", function () {
    const battle = mustCreate("key", "first", "second", 4, 2, "v1");
    expect(battle.turns.length).toBe(0);
    expect(battle.result).toBe(GameOngoing);
    expect(battle.stepBase).toBe(4);
    expect(battle.unitCount).toBe(2);
  });

  it("不正な引数ならInvalidArgumentErrorを返す(名前31文字/stepBase範囲外/unitCount範囲外)", function () {
    const longName = "あ".repeat(31);
    const nameError = createBattle("key", longName, "second", 4, 2, "v1");
    expect(nameError).toBeInstanceOf(InvalidArgumentError);
    if (nameError instanceof InvalidArgumentError) {
      expect(nameError.name).toBe("first_player_name");
    }

    expect(createBattle("key", "first", "second", 1000, 2, "v1")).toBeInstanceOf(InvalidArgumentError);
    expect(createBattle("key", "first", "second", 0, 2, "v1")).toBeInstanceOf(InvalidArgumentError);
    expect(createBattle("key", "first", "second", 4, 15, "v1")).toBeInstanceOf(InvalidArgumentError);
    expect(createBattle("key", "first", "second", 4, 0, "v1")).toBeInstanceOf(InvalidArgumentError);
  });

  it("境界値(名前30文字/stepBase1・999/unitCount1・14)は許容する", function () {
    expect(mustCreate("key", "あ".repeat(30), "second", 999, 14, "v1").stepBase).toBe(999);
    expect(mustCreate("key", "first", "second", 1, 1, "v1").unitCount).toBe(1);
  });
});

describe("Battle#validateBattleArgs", function () {
  it("正常な引数ならnullを返す", function () {
    expect(validateBattleArgs("first", "second", 4, 2)).toBeNull();
  });

  it("先手名が空ならfirst_player_nameのエラー", function () {
    const error = validateBattleArgs("", "second", 4, 2);
    expect(error).toBeInstanceOf(InvalidArgumentError);
    expect(error?.name).toBe("first_player_name");
  });

  it("後手名が31文字ならsecond_player_nameのエラー", function () {
    const error = validateBattleArgs("first", "い".repeat(31), 4, 2);
    expect(error?.name).toBe("second_player_name");
  });

  it("プレイヤー名が空白のみ(半角/全角)ならエラー", function () {
    expect(validateBattleArgs("   ", "second", 4, 2)?.name).toBe("first_player_name");
    expect(validateBattleArgs("first", "　　", 4, 2)?.name).toBe("second_player_name");
  });

  it("前後に空白があっても空白以外の文字があれば通る", function () {
    expect(validateBattleArgs(" 光 ", "second", 4, 2)).toBeNull();
  });

  it("stepBaseが非整数ならstepBaseのエラー", function () {
    const error = validateBattleArgs("first", "second", 1.5, 2);
    expect(error?.name).toBe("stepBase");
  });

  it("unitCountが15ならunitCountのエラー", function () {
    const error = validateBattleArgs("first", "second", 4, 15);
    expect(error?.name).toBe("unitCount");
  });
});

describe("Battle#doAct", function () {
  it("DO_ACTION: actionKeyをresolverで解決しダメージ適用・actorのsteps加算", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    const result = doAct(battle, ref("FIRST", "king"), "atk", [ref("SECOND", "pawn")], resolvers, new Date());
    if (result instanceof Error || "message" in result) {
      expect.unreachable("doAct should succeed");
      return;
    }

    const last = getLastTurn(result);
    expect(last.order.type).toBe("DO_ACTION");

    const pawn = last.units.find((unit) => unit.piece === "pawn");
    const king = last.units.find((unit) => unit.piece === "king");
    expect(pawn?.hp).toBe(1); // 3 - 2
    expect(king?.steps).toBe(4); // 0 + stepBase2 + cost2
    expect(sortedUnits(result)[0].piece).toBe("pawn"); // steps0 < steps4(storageは並べ替えず行動順を算出)
    expect(result.result).toBe(GameOngoing);
  });

  it("死亡駒はunitsに残しつつ行動順から除外し、片側全滅で決着する", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [], leader: true },
    ]);
    const result = doAct(battle, ref("FIRST", "king"), "atk", [ref("SECOND", "pawn")], resolvers, new Date());
    if (result instanceof Error || "message" in result) {
      expect.unreachable("doAct should succeed");
      return;
    }

    const last = getLastTurn(result);
    expect(last.units.length).toBe(2); // 死亡駒もunitsに残す(除外・並べ替えしない)
    expect(sortedUnits(result).length).toBe(1); // 行動順は死亡駒を除外して算出
    expect(sortedUnits(result)[0].piece).toBe("king");
    expect(result.result).toBe(GameFirst);
  });

  it("存在しないactionKeyはDataNotFoundErrorを返す", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    const result = doAct(battle, ref("FIRST", "king"), "noSuchAction", [ref("SECOND", "pawn")], resolvers, new Date());
    expect("message" in result).toBe(true);
  });
});

describe("Battle#doNothing", function () {
  it("自分の持続statusをクリアしsteps加算(cost0)", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: ["interception"], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
    ]);
    const result = doNothing(battle, ref("FIRST", "king"), new Date());

    const last = getLastTurn(result);
    expect(last.order.type).toBe("DO_NOTHING");
    const king = last.units.find((unit) => unit.piece === "king");
    expect(king?.statuses).toEqual([]); // 自分の行動で失効
    expect(king?.steps).toBe(2); // 0 + stepBase2 + cost0
  });
});

// モデル層のゲームルール防御。UI側の制限(選択肢の絞り込み等)を素通りした呼び出しを弾く
describe("Battle#doAct/doNothing/surrenderBattle 検証", function () {
  const aliveUnits = (): Unit[] => [
    { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
    { side: "SECOND", piece: "pawn", hp: 3, steps: 2, statuses: [], leader: true },
  ];

  it("決着済みの対戦ではdoActできない", function () {
    const battle = makeBattle(aliveUnits());
    battle.result = GameFirst;
    const result = doAct(battle, ref("FIRST", "king"), "atk", [ref("SECOND", "pawn")], resolvers, new Date());
    expect(result).toBeInstanceOf(InvalidArgumentError);
    if (result instanceof InvalidArgumentError) {
      expect(result.name).toBe("battle");
    }
  });

  it("手番でないunitはdoActできない(steps最小のunitが手番)", function () {
    const battle = makeBattle(aliveUnits()); // king steps0 < pawn steps2 なので手番はking
    const result = doAct(battle, ref("SECOND", "pawn"), "atk", [ref("FIRST", "king")], resolvers, new Date());
    expect(result).toBeInstanceOf(InvalidArgumentError);
    if (result instanceof InvalidArgumentError) {
      expect(result.name).toBe("actor");
    }
  });

  it("receiverCountを超える対象は選べない", function () {
    const battle = makeBattle(aliveUnits());
    // attackのreceiverCountは1
    const result = doAct(
      battle,
      ref("FIRST", "king"),
      "atk",
      [ref("SECOND", "pawn"), ref("FIRST", "king")],
      resolvers,
      new Date(),
    );
    expect(result).toBeInstanceOf(InvalidArgumentError);
    if (result instanceof InvalidArgumentError) {
      expect(result.name).toBe("receivers");
    }
  });

  it("action.filterに含まれないunitは対象にできない(死亡unitへのheal蘇生防止)", function () {
    const battle = makeBattle([
      { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
      { side: "SECOND", piece: "pawn", hp: 0, steps: 2, statuses: [], leader: false },
      { side: "SECOND", piece: "gold", hp: 3, steps: 4, statuses: [], leader: true },
    ]);
    // attackのfilterはfilterAlive。hp0のpawnは候補に含まれない
    const result = doAct(battle, ref("FIRST", "king"), "atk", [ref("SECOND", "pawn")], resolvers, new Date());
    expect(result).toBeInstanceOf(InvalidArgumentError);
    if (result instanceof InvalidArgumentError) {
      expect(result.name).toBe("receivers");
    }
  });

  it("pieceが解決できないreceiverはDataNotFoundErrorを返す(healの回復量0でのサイレント成功を防ぐ)", function () {
    const battle = makeBattle(aliveUnits());
    const noPiece = { ...resolvers, getPiece: () => null };
    const result = doAct(battle, ref("FIRST", "king"), "atk", [ref("SECOND", "pawn")], noPiece, new Date());
    expect(result).toBeInstanceOf(DataNotFoundError);
    if (result instanceof DataNotFoundError) {
      expect(result.type).toBe("piece");
    }
  });

  it("決着済み/手番でないunitはdoNothingできない", function () {
    const settled = makeBattle(aliveUnits());
    settled.result = GameFirst;
    expect(doNothing(settled, ref("FIRST", "king"), new Date())).toBeInstanceOf(InvalidArgumentError);

    const battle = makeBattle(aliveUnits());
    expect(doNothing(battle, ref("SECOND", "pawn"), new Date())).toBeInstanceOf(InvalidArgumentError);
  });

  it("決着済みの対戦ではsurrenderBattleできない", function () {
    const battle = makeBattle(aliveUnits());
    battle.result = GameFirst;
    expect(surrenderBattle(battle, ref("FIRST", "king"), new Date())).toBeInstanceOf(InvalidArgumentError);
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

describe("Battle#format / formatNormal", function () {
  it("formatは先頭にFORMATION turnを追加する(元battleは不変)", function () {
    const skeleton = mustCreate("key", "first", "second", 2, 3, "v1");
    const units: Unit[] = [{ side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true }];
    const battle = format(skeleton, units, new Date("2024-01-01T00:00:00"));
    expect(battle.turns.length).toBe(1);
    expect(battle.turns[0].order.type).toBe("FORMATION");
    expect(getFormationUnits(battle).map((unit) => unit.piece)).toEqual(["king"]);
    expect(skeleton.turns.length).toBe(0); // 元battleは不変
  });

  it("formatNormalは固定7種×2陣営=14駒でFORMATION turnを作る", function () {
    const skeleton = mustCreate("key", "first", "second", 14, 7, "v1");
    const battle = formatNormal(skeleton, mkPiece, new Date("2024-01-01T00:00:00"));
    const units = getFormationUnits(battle);
    expect(units.length).toBe(14);
    expect(units.filter((unit) => unit.side === "FIRST").length).toBe(7);
    expect(units.filter((unit) => unit.leader).length).toBe(2); // 各陣営king1体ずつ
  });
});

describe("Battle#addFormationUnit / undoFormationUnit", function () {
  const emptyFormation = (unitCount = 3): Battle =>
    format(mustCreate("key", "first", "second", 2, unitCount, "v1"), [], new Date("2024-01-01T00:00:00"));

  const mustAdd = (battle: Battle, side: Side, piece: Piece, isLeader: boolean): Battle => {
    const result = addFormationUnit(battle, side, piece, isLeader);
    if (result instanceof InvalidArgumentError) {
      throw result;
    }
    return result;
  };

  it("駒を編成turnに追加する(hp=MaxHP・leader反映、元battleは不変)", function () {
    const before = emptyFormation();
    const battle = mustAdd(before, "FIRST", mkPiece("king", 2), true);
    const units = getFormationUnits(battle);
    expect(units.length).toBe(1);
    expect(units[0]).toMatchObject({ side: "FIRST", piece: "king", hp: 2, steps: 0, leader: true });
    expect(getFormationUnits(before).length).toBe(0); // 元battleは不変
  });

  it("同一陣営に同じpieceは追加できない", function () {
    const one = mustAdd(emptyFormation(), "FIRST", mkPiece("king", 2), true);
    const two = mustAdd(one, "SECOND", mkPiece("king", 2), true);
    const again = addFormationUnit(two, "FIRST", mkPiece("king", 2), false);
    expect(again).toBeInstanceOf(InvalidArgumentError);
    if (again instanceof InvalidArgumentError) {
      expect(again.name).toBe("piece");
    }
  });

  it("陣営に既にleaderが居ればisLeaderは無視する", function () {
    const one = mustAdd(emptyFormation(), "FIRST", mkPiece("king", 2), true);
    const two = mustAdd(one, "SECOND", mkPiece("king", 2), true);
    const battle = mustAdd(two, "FIRST", mkPiece("rook"), true);
    const units = getFormationUnits(battle);
    expect(units.length).toBe(3);
    expect(units[2].leader).toBe(false); // 既にkingがleaderのため無視
  });

  it("手番でないsideは追加できない(先手と後手が交互に追加する)", function () {
    const result = addFormationUnit(emptyFormation(), "SECOND", mkPiece("king", 2), true);
    expect(result).toBeInstanceOf(InvalidArgumentError);
    if (result instanceof InvalidArgumentError) {
      expect(result.name).toBe("side");
    }
  });

  it("両陣営が上限に達したら(リーダー未指定で編成未完了でも)追加できない", function () {
    const one = mustAdd(emptyFormation(1), "FIRST", mkPiece("king", 2), false);
    const full = mustAdd(one, "SECOND", mkPiece("king", 2), false);
    expect(addFormationUnit(full, "FIRST", mkPiece("rook"), false)).toBeInstanceOf(InvalidArgumentError);
    expect(undoFormationUnit(full)).not.toBeInstanceOf(InvalidArgumentError); // 取り消しでリーダーを指定し直せる
  });

  it("編成完了後(対戦開始後)は追加も取り消しもできない", function () {
    const one = mustAdd(emptyFormation(1), "FIRST", mkPiece("king", 2), true);
    const complete = mustAdd(one, "SECOND", mkPiece("king", 2), true);
    expect(addFormationUnit(complete, "FIRST", mkPiece("rook"), false)).toBeInstanceOf(InvalidArgumentError);
    expect(undoFormationUnit(complete)).toBeInstanceOf(InvalidArgumentError);
  });

  it("undoFormationUnitは最後のunitを取り消し、空の編成では取り消せない", function () {
    const one = mustAdd(emptyFormation(), "FIRST", mkPiece("king", 2), true);
    const undone = undoFormationUnit(one);
    if (undone instanceof InvalidArgumentError) {
      expect.unreachable("undo should succeed");
      return;
    }
    expect(getFormationUnits(undone).length).toBe(0);
    expect(getFormationUnits(one).length).toBe(1); // 元battleは不変
    expect(undoFormationUnit(undone)).toBeInstanceOf(InvalidArgumentError);
  });
});

describe("Battle#simulate", function () {
  it("受け手が生存する見積り(hp残る)", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    const result = simulate(attack, ref("FIRST", "king"), ref("SECOND", "pawn"), turn, resolvers);
    expect(result.survive).toBe(true);
    expect(result.unit?.hp).toBe(1); // 3 - 2
  });

  it("受け手が倒れる見積り(hp0)", function () {
    const turn = start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 2, steps: 0, statuses: [], leader: true },
      ],
      new Date("2024-01-01T00:00:00"),
    );
    const result = simulate(attack, ref("FIRST", "king"), ref("SECOND", "pawn"), turn, resolvers);
    expect(result.survive).toBe(false);
    expect(result.unit?.hp).toBe(0); // 2 - 2
  });

  it("actor自身を対象にした見積りは実行結果と一致する(actorのstatusesクリア後にactされる)", function () {
    const units = (): Unit[] => [
      { side: "FIRST", piece: "king", hp: 3, steps: 0, statuses: ["interception"], leader: true },
      { side: "SECOND", piece: "pawn", hp: 3, steps: 2, statuses: [], leader: true },
    ];
    const battle = makeBattle(units());

    const simulated = simulate(attack, ref("FIRST", "king"), ref("FIRST", "king"), getLastTurn(battle), resolvers);
    // interceptionは行動時に失効するため軽減されない(クリア前にactするとhp2に見積もるずれが出る)
    expect(simulated.unit?.hp).toBe(1); // 3 - 2

    const acted = doAct(battle, ref("FIRST", "king"), "atk", [ref("FIRST", "king")], resolvers, new Date());
    if (acted instanceof Error || "message" in acted) {
      expect.unreachable("doAct should succeed");
      return;
    }
    const king = getLastTurn(acted).units.find((unit) => unit.piece === "king");
    expect(king?.hp).toBe(simulated.unit?.hp); // プレビューと実行結果の一致
  });
});
