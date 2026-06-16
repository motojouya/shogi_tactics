import { describe, it, expect } from "vitest";

import type { Piece } from "./piece";

import { buildNormalUnits, NORMAL_PIECE_ORDER, NORMAL_UNIT_COUNT, NORMAL_STEP_BASE } from "./normal_mode";

const piece = (key: string, maxHP: number): Piece => ({
  key,
  name: key,
  description: "",
  MaxHP: maxHP,
  move: 3,
  actions: [],
});

// keyからMaxHPを引けるダミーgetter。kingだけHP2、他はHP3。
const getPiece = (key: string): Piece | undefined => (key === "king" ? piece("king", 2) : piece(key, 3));

describe("normal_mode#buildNormalUnits", function () {
  it("駒順ごとに先手->後手で交互に並ぶ", function () {
    const units = buildNormalUnits(getPiece);

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

  it("先手/後手それぞれunitCount体、stepsは0", function () {
    const units = buildNormalUnits(getPiece);

    expect(units.filter((unit) => unit.side === "FIRST").length).toBe(NORMAL_UNIT_COUNT);
    expect(units.filter((unit) => unit.side === "SECOND").length).toBe(NORMAL_UNIT_COUNT);
    expect(units.every((unit) => unit.steps === 0)).toBe(true);
  });

  it("leaderはkingのみ。各陣営ちょうど1体", function () {
    const units = buildNormalUnits(getPiece);

    expect(units.filter((unit) => unit.leader).every((unit) => unit.piece === "king")).toBe(true);
    expect(units.filter((unit) => unit.side === "FIRST" && unit.leader).length).toBe(1);
    expect(units.filter((unit) => unit.side === "SECOND" && unit.leader).length).toBe(1);
  });

  it("hpは各pieceのMaxHPで初期化される", function () {
    const units = buildNormalUnits(getPiece);

    expect(units.find((unit) => unit.piece === "king")?.hp).toBe(2);
    expect(units.find((unit) => unit.piece === "rook")?.hp).toBe(3);
  });

  it("stepBase/unitCountの定数値", function () {
    expect(NORMAL_UNIT_COUNT).toBe(7);
    expect(NORMAL_STEP_BASE).toBe(14);
  });
});
