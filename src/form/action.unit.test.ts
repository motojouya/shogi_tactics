import { describe, it, expect } from "vitest";

import { selectUnit, toReceivers, receiverSelectOption } from "./action";
import { pieceRepository } from "../repository/piece";

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

describe("formAction#receiverSelectOption", function () {
  const toOption = receiverSelectOption(pieceRepository);

  it("UnitReferenceをvalue/labelのSelectOptionへ変換する(先手は`先`、labelはname（shogiName）)", function () {
    expect(toOption({ side: "FIRST", piece: "king" })).toEqual({ value: "FIRST:king", label: "先:将軍（王将）" });
  });

  it("後手は`後`、labelはname（shogiName）になる", function () {
    expect(toOption({ side: "SECOND", piece: "gold" })).toEqual({ value: "SECOND:gold", label: "後:重装兵（金将）" });
  });

  it("未知の駒キーはlabelにキーをそのまま使う", function () {
    expect(toOption({ side: "FIRST", piece: "unknown" })).toEqual({ value: "FIRST:unknown", label: "先:unknown" });
  });
});
