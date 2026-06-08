import type { Clothing } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { coldFeet } from "../../skill/coldFeet";

export const steelArmor: Clothing = {
  name: "steelArmor",
  label: "鋼鉄の鎧",
  skills: [coldFeet],
  abilities: [],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 0,
    VIT: 50,
    DEX: 0,
    AGI: 0,
    AVD: 0,
    INT: 0,
    MND: 10,
    RES: 0,
    WT: 20,
    StabResistance: 20,
    SlashResistance: 0,
    BlowResistance: 10,
    FireSuitable: 0,
    RockSuitable: 0,
    WaterSuitable: 0,
    IceSuitable: 0,
    AirSuitable: 0,
    ThunderSuitable: 0,
    move: 0,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(steelArmor, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "鋼鉄の鎧。刺突耐性がある",
};
