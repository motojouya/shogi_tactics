import { describe, it, expect } from "vitest";

import type { Physical } from "../../src/model/physical";
import { addPhysicals } from "../../src/model/physical";

const basePhysical: Physical = {
  MaxHP: 100,
  WT: 100,
  move: 4,
};

describe("Physical#addPhysicals", function () {
  it("add", function () {
    const result = addPhysicals([
      basePhysical,
      {
        MaxHP: 10,
        WT: 10,
        move: 1,
      },
      {
        MaxHP: 1,
        WT: 1,
        move: 2,
      },
    ]);

    expect(result.MaxHP).toBe(111);
    expect(result.WT).toBe(111);
    expect(result.move).toBe(7);
  });

  it("minus", function () {
    const result = addPhysicals([
      basePhysical,
      {
        MaxHP: -10,
        WT: -10,
        move: 1,
      },
      {
        MaxHP: 1,
        WT: 1,
        move: -1,
      },
    ]);

    expect(result.MaxHP).toBe(91);
    expect(result.WT).toBe(91);
    expect(result.move).toBe(4);
  });
});
