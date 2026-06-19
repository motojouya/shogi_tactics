import { describe, it, expect } from "vitest";

import type { Unit, Side } from "./unit";
import type { Piece } from "./piece";
import {
  copyUnit,
  toUnitReference,
  sameUnit,
  selectUnit,
  buildNormalUnits,
  NORMAL_PIECE_ORDER,
  nextFormationSide,
  sideHasLeader,
  canAddPiece,
  isFormationComplete,
} from "./unit";

const mkUnit = (side: Side, piece: string, leader = false): Unit => ({
  side,
  piece,
  hp: 1,
  steps: 0,
  statuses: [],
  leader,
});

const normalPiece = (key: string, maxHP: number): Piece => ({
  key,
  name: key,
  description: "",
  MaxHP: maxHP,
  move: 3,
  actions: [],
});

// keyからMaxHPを引けるダミーgetter。kingだけHP2、他はHP3。
const getNormalPiece = (key: string): Piece | undefined =>
  key === "king" ? normalPiece("king", 2) : normalPiece(key, 3);

const baseUnit: Unit = {
  side: "FIRST",
  piece: "king",
  hp: 2,
  steps: 0,
  statuses: ["guard"],
};

describe("Unit#copyUnit", function () {
  it("値が複製される", function () {
    const copied = copyUnit(baseUnit);

    expect(copied).toEqual(baseUnit);
    expect(copied).not.toBe(baseUnit);
  });

  it("statuses配列は独立している", function () {
    const copied = copyUnit(baseUnit);
    copied.statuses.push("stop");

    expect(copied.statuses).toEqual(["guard", "stop"]);
    expect(baseUnit.statuses).toEqual(["guard"]);
  });
});

describe("Unit#toUnitReference", function () {
  it("side,pieceのみ抽出される", function () {
    const reference = toUnitReference(baseUnit);

    expect(reference).toEqual({ side: "FIRST", piece: "king" });
  });
});

describe("Unit#sameUnit", function () {
  it("side,pieceが一致すればtrue", function () {
    expect(sameUnit({ side: "FIRST", piece: "king" }, { side: "FIRST", piece: "king" })).toBe(true);
  });

  it("pieceが異なればfalse", function () {
    expect(sameUnit({ side: "FIRST", piece: "king" }, { side: "FIRST", piece: "gold" })).toBe(false);
  });

  it("sideが異なればfalse", function () {
    expect(sameUnit({ side: "FIRST", piece: "king" }, { side: "SECOND", piece: "king" })).toBe(false);
  });
});

describe("Unit#selectUnit", function () {
  it("valueからUnitReferenceを復元する", function () {
    expect(selectUnit("FIRST:king")).toEqual({ side: "FIRST", piece: "king" });
    expect(selectUnit("SECOND:gold")).toEqual({ side: "SECOND", piece: "gold" });
  });
});

describe("Unit#buildNormalUnits", function () {
  it("駒順ごとに先手->後手で交互に並ぶ", function () {
    const units = buildNormalUnits(getNormalPiece);

    expect(units.length).toBe(NORMAL_PIECE_ORDER.length * 2);
    expect(units.map((unit) => `${unit.side}:${unit.piece}`)).toEqual([
      "FIRST:rook",
      "SECOND:rook",
      "FIRST:bishop",
      "SECOND:bishop",
      "FIRST:gold",
      "SECOND:gold",
      "FIRST:silver",
      "SECOND:silver",
      "FIRST:knight",
      "SECOND:knight",
      "FIRST:lance",
      "SECOND:lance",
      "FIRST:king",
      "SECOND:king",
    ]);
  });

  it("先手/後手それぞれNORMAL_PIECE_ORDER.length体、stepsは0", function () {
    const units = buildNormalUnits(getNormalPiece);

    expect(units.filter((unit) => unit.side === "FIRST").length).toBe(NORMAL_PIECE_ORDER.length);
    expect(units.filter((unit) => unit.side === "SECOND").length).toBe(NORMAL_PIECE_ORDER.length);
    expect(units.every((unit) => unit.steps === 0)).toBe(true);
  });

  it("leaderはkingのみ。各陣営ちょうど1体", function () {
    const units = buildNormalUnits(getNormalPiece);

    expect(units.filter((unit) => unit.leader).every((unit) => unit.piece === "king")).toBe(true);
    expect(units.filter((unit) => unit.side === "FIRST" && unit.leader).length).toBe(1);
    expect(units.filter((unit) => unit.side === "SECOND" && unit.leader).length).toBe(1);
  });

  it("hpは各pieceのMaxHPで初期化される", function () {
    const units = buildNormalUnits(getNormalPiece);

    expect(units.find((unit) => unit.piece === "king")?.hp).toBe(2);
    expect(units.find((unit) => unit.piece === "rook")?.hp).toBe(3);
  });
});

describe("Unit#nextFormationSide", function () {
  it("空なら先手から", function () {
    expect(nextFormationSide([], 2)).toBe("FIRST");
  });

  it("先手が1多ければ次は後手", function () {
    expect(nextFormationSide([mkUnit("FIRST", "rook")], 2)).toBe("SECOND");
  });

  it("数が揃っていてunitCount未満なら次は先手", function () {
    expect(nextFormationSide([mkUnit("FIRST", "rook"), mkUnit("SECOND", "rook")], 2)).toBe("FIRST");
  });

  it("双方unitCount到達でnull(編成完了)", function () {
    const units = [
      mkUnit("FIRST", "rook"),
      mkUnit("FIRST", "king", true),
      mkUnit("SECOND", "rook"),
      mkUnit("SECOND", "king", true),
    ];
    expect(nextFormationSide(units, 2)).toBeNull();
  });
});

describe("Unit#sideHasLeader", function () {
  it("該当陣営にleaderが居ればtrue", function () {
    const units = [mkUnit("FIRST", "king", true), mkUnit("SECOND", "rook")];
    expect(sideHasLeader(units, "FIRST")).toBe(true);
    expect(sideHasLeader(units, "SECOND")).toBe(false);
  });
});

describe("Unit#canAddPiece", function () {
  it("同陣営に同じ駒は追加不可。別陣営/別駒は可", function () {
    const units = [mkUnit("FIRST", "rook")];
    expect(canAddPiece(units, "FIRST", "rook")).toBe(false);
    expect(canAddPiece(units, "SECOND", "rook")).toBe(true);
    expect(canAddPiece(units, "FIRST", "gold")).toBe(true);
  });
});

describe("Unit#isFormationComplete", function () {
  const complete = [
    mkUnit("FIRST", "rook"),
    mkUnit("FIRST", "king", true),
    mkUnit("SECOND", "rook"),
    mkUnit("SECOND", "king", true),
  ];

  it("双方unitCount到達かつ各陣営leader1体ならtrue", function () {
    expect(isFormationComplete(complete, 2)).toBe(true);
  });

  it("leaderが揃わなければfalse", function () {
    const noLeader = [
      mkUnit("FIRST", "rook"),
      mkUnit("FIRST", "gold"),
      mkUnit("SECOND", "rook"),
      mkUnit("SECOND", "king", true),
    ];
    expect(isFormationComplete(noLeader, 2)).toBe(false);
  });

  it("unitCountに満たなければfalse", function () {
    expect(isFormationComplete([mkUnit("FIRST", "king", true), mkUnit("SECOND", "king", true)], 2)).toBe(false);
  });
});
