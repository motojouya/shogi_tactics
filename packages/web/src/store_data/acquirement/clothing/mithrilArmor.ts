import type { Clothing } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { concentration } from "../../skill/concentration";

export const mithrilArmor: Clothing = {
  name: "mithrilArmor",
  label: "ミスリルの鎧",
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
    MND: 20,
    RES: 0,
    WT: 20,
    StabResistance: 0,
    SlashResistance: 0,
    BlowResistance: 0,
    FireSuitable: 10,
    RockSuitable: 10,
    WaterSuitable: 10,
    IceSuitable: 10,
    AirSuitable: 10,
    ThunderSuitable: 10,
    move: 0,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(mithrilArmor, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "ミスリルの鎧。魔法属性が高い",
};
