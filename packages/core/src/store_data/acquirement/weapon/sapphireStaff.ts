import type { Weapon } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { gunWater } from "../../skill/gunWater";
import { stickyRain } from "../../skill/stickyRain";
import { downRushing } from "../../skill/downRushing";

export const sapphireStaff: Weapon = {
  name: "sapphireStaff",
  label: "サファイアスタッフ",
  skills: [gunWater, downRushing, stickyRain],
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
    WaterSuitable: 10,
    IceSuitable: 0,
    AirSuitable: 0,
    ThunderSuitable: 0,
    move: 0,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(sapphireStaff, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "サファイアスタッフ。水属性",
};
