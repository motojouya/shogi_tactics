import type { Weapon } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { hailstone } from "../../skill/hailstone";
import { frostbite } from "../../skill/frostbite";
import { cumulonimbus } from "../../skill/cumulonimbus";

export const jadeStaff: Weapon = {
  name: "jadeStaff",
  label: "ヒスイスタッフ",
  skills: [hailstone, frostbite, cumulonimbus],
  abilities: [],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 0,
    VIT: 0,
    DEX: 0,
    AGI: 0,
    AVD: 0,
    INT: 30,
    MND: 0,
    RES: 0,
    WT: 10,
    StabResistance: 0,
    SlashResistance: 0,
    BlowResistance: 0,
    FireSuitable: 0,
    RockSuitable: 0,
    WaterSuitable: 0,
    IceSuitable: 10,
    AirSuitable: 0,
    ThunderSuitable: 0,
    move: 0,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(jadeStaff, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "ヒスイスタッフ。氷属性",
};
