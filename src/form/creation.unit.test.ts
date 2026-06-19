import { describe, it, expect } from "vitest";

import { creationFormSchema } from "./creation";

describe("formCreation#creationFormSchema(通常モード)", function () {
  it("player名が揃っていればparseできる(stepBase/unitCountは既定値)", function () {
    const result = creationFormSchema.safeParse({
      mode: "normal",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: 14,
      unitCount: 7,
    });
    expect(result.success).toBe(true);
  });

  it("player名が空ならエラー", function () {
    const result = creationFormSchema.safeParse({
      mode: "normal",
      first_player_name: "",
      second_player_name: "闇",
      stepBase: 14,
      unitCount: 7,
    });
    expect(result.success).toBe(false);
  });
});

describe("formCreation#creationFormSchema(戦乱モード)", function () {
  it("player名+stepBase/unitCount(1以上のnumber)でparseでき、numberとして取れる", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: 10,
      unitCount: 5,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stepBase).toBe(10);
      expect(result.data.unitCount).toBe(5);
    }
  });

  it("stepBaseがNaN(未入力)ならエラー", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: Number.NaN,
      unitCount: 5,
    });
    expect(result.success).toBe(false);
  });

  it("unitCountが0ならエラー", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: 10,
      unitCount: 0,
    });
    expect(result.success).toBe(false);
  });
});
