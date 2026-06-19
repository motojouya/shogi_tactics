import { describe, it, expect } from "vitest";

import { formationFormSchema, pieceSelectOption } from "./formation";

describe("formFormation#formationFormSchema", function () {
  it("piece+leaderでparseできる", function () {
    const result = formationFormSchema.safeParse({ piece: "king", leader: true });
    expect(result.success).toBe(true);
  });

  it("pieceが空ならエラー(駒未選択)", function () {
    const result = formationFormSchema.safeParse({ piece: "", leader: false });
    expect(result.success).toBe(false);
  });
});

describe("formFormation#pieceSelectOption", function () {
  it("駒をvalue=key/label=nameの選択肢へ変換する", function () {
    const option = pieceSelectOption({
      key: "king",
      name: "王",
      description: "",
      MaxHP: 2,
      move: 1,
      actions: [],
    });
    expect(option).toEqual({ value: "king", label: "王" });
  });
});
