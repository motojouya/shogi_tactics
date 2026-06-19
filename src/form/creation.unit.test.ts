import { describe, it, expect } from "vitest";

import { normalCreationFormSchema, warCreationFormSchema } from "./creation";

describe("formCreation#normalCreationFormSchema", function () {
  it("player名が揃っていればparseできる", function () {
    const result = normalCreationFormSchema.safeParse({ first_player_name: "光", second_player_name: "闇" });
    expect(result.success).toBe(true);
  });

  it("player名が空ならエラー", function () {
    const result = normalCreationFormSchema.safeParse({ first_player_name: "", second_player_name: "闇" });
    expect(result.success).toBe(false);
  });
});

describe("formCreation#warCreationFormSchema", function () {
  it("player名+stepBase/unitCount(1以上)でparseし数値化される", function () {
    const result = warCreationFormSchema.safeParse({
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "10",
      unitCount: "5",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.stepBase).toBe(10);
      expect(result.data.unitCount).toBe(5);
    }
  });

  it("stepBaseが空文字ならエラー(1以上を要求)", function () {
    const result = warCreationFormSchema.safeParse({
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "",
      unitCount: "5",
    });
    expect(result.success).toBe(false);
  });

  it("unitCountが0ならエラー", function () {
    const result = warCreationFormSchema.safeParse({
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "10",
      unitCount: "0",
    });
    expect(result.success).toBe(false);
  });
});
