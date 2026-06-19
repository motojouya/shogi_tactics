import { describe, it, expect } from "vitest";

import { creationFormSchema } from "./creation";

describe("formCreation#creationFormSchema(通常モード)", function () {
  it("player名が揃っていればparseできる(stepBase/unitCountは不要)", function () {
    const result = creationFormSchema.safeParse({
      mode: "normal",
      first_player_name: "光",
      second_player_name: "闇",
    });
    expect(result.success).toBe(true);
  });

  it("player名が空ならエラー", function () {
    const result = creationFormSchema.safeParse({
      mode: "normal",
      first_player_name: "",
      second_player_name: "闇",
    });
    expect(result.success).toBe(false);
  });
});

describe("formCreation#creationFormSchema(戦乱モード)", function () {
  it("player名+stepBase/unitCount(1以上)でparseできる", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "10",
      unitCount: "5",
    });
    expect(result.success).toBe(true);
  });

  it("stepBaseが空文字ならエラー(1以上を要求)", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "",
      unitCount: "5",
    });
    expect(result.success).toBe(false);
  });

  it("unitCountが0ならエラー", function () {
    const result = creationFormSchema.safeParse({
      mode: "war",
      first_player_name: "光",
      second_player_name: "闇",
      stepBase: "10",
      unitCount: "0",
    });
    expect(result.success).toBe(false);
  });
});
