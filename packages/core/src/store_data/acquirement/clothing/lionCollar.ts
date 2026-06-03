import type { Clothing } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";

export const lionCollar: Clothing = {
  name: "lionCollar",
  label: "獅子の襟飾り",
  skills: [],
  abilities: [],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 10,
    VIT: 20,
    DEX: 0,
    AGI: 0,
    AVD: 0,
    INT: 0,
    MND: 10,
    RES: 0,
    WT: 10,
    StabResistance: 0,
    SlashResistance: 0,
    BlowResistance: 0,
    FireSuitable: 0,
    RockSuitable: 0,
    WaterSuitable: 0,
    IceSuitable: 0,
    AirSuitable: 0,
    ThunderSuitable: 0,
    move: 1,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(lionCollar, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "獅子の襟飾り",
};
