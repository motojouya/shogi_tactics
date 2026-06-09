import { describe, it, expect } from "vitest";

import type { Charactor } from "../../src/model/charactor";
import type { CharactorJson } from "../../src/store_schema/charactor";

import { getPhysical } from "../../src/model/charactor";
import { toCharactor } from "../../src/store_schema/charactor";

describe("Charctor#toCharactor", function () {
  it("ok", function () {
    const charactor = toCharactor({
      name: "sam",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 115,
    } as CharactorJson) as Charactor;
    expect(charactor.name).toBe("sam");

    const physical = getPhysical(charactor);
    expect(physical.MaxHP).toBe(300);
    expect(physical.WT).toBe(100);
    expect(physical.move).toBe(4);
  });
});
