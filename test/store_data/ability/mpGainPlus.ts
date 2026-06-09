import { describe, it, expect } from "vitest";

import type { CharactorBattling } from "../../../src/model/charactor";

import { toCharactorBattling } from "../../../src/store_schema/charactor";
import { mpGainPlus } from "../../../src/store_data/ability/mpGainPlus";

describe("mpGainPlus#wait", function () {
  it("calc", function () {
    const charactor = toCharactorBattling({
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 115,
      isVisitor: false,
    }) as CharactorBattling;
    expect(charactor.mp).toBe(0);

    const result = mpGainPlus.wait(30, charactor);
    expect(result.mp).toBe(1);
  });
  it("zero", function () {
    const charactor = toCharactorBattling({
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 115,
      isVisitor: false,
    }) as CharactorBattling;
    expect(charactor.mp).toBe(0);

    const result = mpGainPlus.wait(0, charactor);
    expect(result.mp).toBe(0);
  });
  it("over", function () {
    const charactor = toCharactorBattling({
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 115,
      isVisitor: false,
    }) as CharactorBattling;
    expect(charactor.mp).toBe(0);

    const result = mpGainPlus.wait(210, charactor);
    expect(result.mp).toBe(10);
  });
});
