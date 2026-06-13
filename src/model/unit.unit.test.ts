import { describe, it, expect } from "vitest";

import type { Unit } from "./unit";
import type { Piece } from "./piece";
import { copyUnit, toUnitReference, sameUnit, getSelectOption, selectUnit } from "./unit";

const baseUnit: Unit = {
  side: "FIRST",
  piece: "king",
  hp: 2,
  steps: 0,
  statuses: ["guard"],
};

const kingPiece: Piece = {
  key: "king",
  name: "将軍",
  description: "王将",
  MaxHP: 2,
  move: 3,
  actions: [],
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

describe("Unit#getSelectOption", function () {
  it("先手はlabelに先＋piece名、valueにside＋pieceのkey", function () {
    const option = getSelectOption(baseUnit, kingPiece);

    expect(option.label).toBe("先:将軍");
    expect(option.value).toBe("FIRST:king");
  });

  it("後手はlabelが後始まり", function () {
    const option = getSelectOption({ ...baseUnit, side: "SECOND" }, kingPiece);

    expect(option.label).toBe("後:将軍");
    expect(option.value).toBe("SECOND:king");
  });
});

describe("Unit#selectUnit", function () {
  it("valueからUnitReferenceを復元する", function () {
    expect(selectUnit("FIRST:king")).toEqual({ side: "FIRST", piece: "king" });
    expect(selectUnit("SECOND:gold")).toEqual({ side: "SECOND", piece: "gold" });
  });

  it("getSelectOptionのvalueと往復できる", function () {
    const option = getSelectOption(baseUnit, kingPiece);

    expect(selectUnit(option.value)).toEqual({ side: "FIRST", piece: "king" });
  });
});
