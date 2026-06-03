import type { Clothing } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { concentration } from "../../skill/concentration";

export const furAironArmor: Clothing = {
  name: "furAironArmor",
  label: "革と鉄の鎧",
  skills: [concentration],
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
    StabResistance: 10,
    SlashResistance: 20,
    BlowResistance: 0,
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
    const validate = createValidateWearable(furAironArmor, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "革と鉄の鎧。斬撃耐性がある",
};
