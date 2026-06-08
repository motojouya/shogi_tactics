import { describe, it, expect } from "vitest";

import type { Physical } from "../../src/model/physical";
import { addPhysicals } from "../../src/model/physical";

const basePhysical: Physical = {
  MaxHP: 100,
  MaxMP: 100,
  STR: 100,
  VIT: 100,
  DEX: 100,
  AGI: 100,
  AVD: 100,
  INT: 100,
  MND: 100,
  RES: 100,
  WT: 100,
  StabResistance: 0,
  SlashResistance: 0,
  BlowResistance: 0,
  FireSuitable: 0,
  RockSuitable: 0,
  WaterSuitable: 0,
  IceSuitable: 0,
  AirSuitable: 0,
  ThunderSuitable: 0,
  move: 4,
  jump: 3,
};

describe("Physical#addPhysicals", function () {
  it("add", function () {
    const result = addPhysicals([
      basePhysical,
      {
        MaxHP: 10,
        MaxMP: 10,
        STR: 10,
        VIT: 10,
        DEX: 10,
        AGI: 10,
        AVD: 10,
        INT: 10,
        MND: 10,
        RES: 10,
        WT: 10,
        StabResistance: 10,
        SlashResistance: 10,
        BlowResistance: 10,
        FireSuitable: 10,
        RockSuitable: 10,
        WaterSuitable: 10,
        IceSuitable: 10,
        AirSuitable: 10,
        ThunderSuitable: 10,
        move: 1,
        jump: 1,
      },
      {
        MaxHP: 1,
        MaxMP: 1,
        STR: 1,
        VIT: 1,
        DEX: 1,
        AGI: 1,
        AVD: 1,
        INT: 1,
        MND: 1,
        RES: 1,
        WT: 1,
        StabResistance: 1,
        SlashResistance: 1,
        BlowResistance: 1,
        FireSuitable: 1,
        RockSuitable: 1,
        WaterSuitable: 1,
        IceSuitable: 1,
        AirSuitable: 1,
        ThunderSuitable: 1,
        move: 2,
        jump: 2,
      },
    ]);

    expect(result.MaxHP).toBe(111);
    expect(result.MaxMP).toBe(111);
    expect(result.STR).toBe(111);
    expect(result.VIT).toBe(111);
    expect(result.DEX).toBe(111);
    expect(result.AGI).toBe(111);
    expect(result.AVD).toBe(111);
    expect(result.INT).toBe(111);
    expect(result.MND).toBe(111);
    expect(result.RES).toBe(111);
    expect(result.WT).toBe(111);
    expect(result.StabResistance).toBe(11);
    expect(result.SlashResistance).toBe(11);
    expect(result.BlowResistance).toBe(11);
    expect(result.FireSuitable).toBe(11);
    expect(result.RockSuitable).toBe(11);
    expect(result.WaterSuitable).toBe(11);
    expect(result.IceSuitable).toBe(11);
    expect(result.AirSuitable).toBe(11);
    expect(result.ThunderSuitable).toBe(11);
    expect(result.move).toBe(7);
    expect(result.jump).toBe(6);
  });

  it("minus", function () {
    const result = addPhysicals([
      basePhysical,
      {
        MaxHP: -10,
        MaxMP: -10,
        STR: -10,
        VIT: -10,
        DEX: -10,
        AGI: -10,
        AVD: -10,
        INT: -10,
        MND: -10,
        RES: -10,
        WT: -10,
        StabResistance: 10,
        SlashResistance: 10,
        BlowResistance: 10,
        FireSuitable: 10,
        RockSuitable: 10,
        WaterSuitable: 10,
        IceSuitable: 10,
        AirSuitable: 10,
        ThunderSuitable: 10,
        move: 1,
        jump: 1,
      },
      {
        MaxHP: 1,
        MaxMP: 1,
        STR: 1,
        VIT: 1,
        DEX: 1,
        AGI: 1,
        AVD: 1,
        INT: 1,
        MND: 1,
        RES: 1,
        WT: 1,
        StabResistance: -1,
        SlashResistance: -1,
        BlowResistance: -1,
        FireSuitable: -1,
        RockSuitable: -1,
        WaterSuitable: -1,
        IceSuitable: -1,
        AirSuitable: -1,
        ThunderSuitable: -1,
        move: -1,
        jump: -1,
      },
    ]);

    expect(result.MaxHP).toBe(91);
    expect(result.MaxMP).toBe(91);
    expect(result.STR).toBe(91);
    expect(result.VIT).toBe(91);
    expect(result.DEX).toBe(91);
    expect(result.AGI).toBe(91);
    expect(result.AVD).toBe(91);
    expect(result.INT).toBe(91);
    expect(result.MND).toBe(91);
    expect(result.RES).toBe(91);
    expect(result.WT).toBe(91);
    expect(result.StabResistance).toBe(9);
    expect(result.SlashResistance).toBe(9);
    expect(result.BlowResistance).toBe(9);
    expect(result.FireSuitable).toBe(9);
    expect(result.RockSuitable).toBe(9);
    expect(result.WaterSuitable).toBe(9);
    expect(result.IceSuitable).toBe(9);
    expect(result.AirSuitable).toBe(9);
    expect(result.ThunderSuitable).toBe(9);
    expect(result.move).toBe(4);
    expect(result.jump).toBe(3);
  });
});
