import { describe, it, expect } from "vitest";

import { selectUnit, toReceivers } from "./action";

describe("formAction#selectUnit", function () {
  it("`${side}:${piece}` のvalueからUnitReferenceを復元する", function () {
    expect(selectUnit("FIRST:king")).toEqual({ side: "FIRST", piece: "king" });
    expect(selectUnit("SECOND:gold")).toEqual({ side: "SECOND", piece: "gold" });
  });
});

describe("formAction#toReceivers", function () {
  it("受け手フォーム値の配列をUnitReference[]へ解決する", function () {
    const result = toReceivers([{ value: "FIRST:king" }, { value: "SECOND:gold" }]);
    expect(result).toEqual([
      { side: "FIRST", piece: "king" },
      { side: "SECOND", piece: "gold" },
    ]);
  });

  it("undefinedや空valueは除外する", function () {
    const result = toReceivers([undefined, { value: "FIRST:king" }, { value: undefined }, {}]);
    expect(result).toEqual([{ side: "FIRST", piece: "king" }]);
  });
});
