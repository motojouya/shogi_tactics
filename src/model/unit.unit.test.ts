import { describe, it, expect } from "vitest";

import type { Unit } from "./unit";
import { copyUnit, toUnitReference, sameUnit, selectUnit } from "./unit";

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
