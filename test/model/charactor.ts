import { describe, it, expect } from "vitest";

import type { Charactor } from "../../src/model/charactor";
import type { CharactorJson } from "../../src/store_schema/charactor";

import { getAbilities, getSkills, getPhysical } from "../../src/model/charactor";
import { toCharactor } from "../../src/store_schema/charactor";
import { NotWearableErorr } from "../../src/model/acquirement";
import { DataNotFoundError } from "../../src/store_utility/schema";

describe("Charctor#toCharactor", function () {
  it("DataNotFoundError", function () {
    const charactor = toCharactor({
      name: "sam",
      race: "race01",
      blessing: "blessing01",
      clothing: "clothing01",
      weapon: "weapon01",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 120,
    } as CharactorJson);
    expect(charactor instanceof DataNotFoundError).toBe(true);
    if (charactor instanceof DataNotFoundError) {
      expect(charactor.name).toBe("race01");
      expect(charactor.type).toBe("race");
      expect(charactor.message).toBe("race01という種族は存在しません");
    } else {
      expect.unreachable("charactor should be value");
    }
  });
  it("NotWearableErorr", function () {
    const charactor = toCharactor({
      name: "sam",
      race: "fairy",
      blessing: "earth",
      clothing: "steelArmor",
      weapon: "swordAndShield",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 120,
    } as CharactorJson);
    expect(charactor instanceof NotWearableErorr).toBe(true);
    if (charactor instanceof NotWearableErorr) {
      expect(charactor.acquirement.name).toBe("earth");
      expect(charactor.cause.name).toBe("fairy");
      expect(charactor.message).toBe("このキャラクターの設定ではearthを装備できません");
    } else {
      expect.unreachable("charactor should be value");
    }
  });
  it("ok", function () {
    const charactor = toCharactor({
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
      statuses: [],
      hp: 100,
      mp: 0,
      restWt: 115,
    } as CharactorJson) as Charactor;
    expect(charactor.name).toBe("sam");
    expect(charactor.race.name).toBe("human");
    expect(charactor.blessing.name).toBe("earth");
    expect(charactor.clothing.name).toBe("redRobe");
    expect(charactor.weapon.name).toBe("rubyRod");

    const abilities = getAbilities(charactor);
    expect(abilities.length).toBe(1);
    expect(abilities[0].name).toBe("mpGainPlus");

    const skills = getSkills(charactor);
    expect(skills.length).toBe(4);
    expect(skills[0].name).toBe("fireWall");
    expect(skills[1].name).toBe("flameFall");
    expect(skills[2].name).toBe("smallHeat");
    expect(skills[3].name).toBe("ghostFire");

    const physical = getPhysical(charactor);
    expect(physical.MaxHP).toBe(300);
    expect(physical.MaxMP).toBe(200);
    expect(physical.STR).toBe(100);
    expect(physical.VIT).toBe(110);
    expect(physical.DEX).toBe(100);
    expect(physical.AGI).toBe(100);
    expect(physical.AVD).toBe(100);
    expect(physical.INT).toBe(130);
    expect(physical.MND).toBe(120);
    expect(physical.RES).toBe(100);
    expect(physical.WT).toBe(130);
  });
});
