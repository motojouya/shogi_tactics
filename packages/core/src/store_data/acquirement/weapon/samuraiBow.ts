import type { Weapon } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { shot } from "../../skill/shot";
import { hardRain } from "../../skill/hardRain";
import { overbear } from "../../skill/overbear";

export const samuraiBow: Weapon = {
  name: "samuraiBow",
  label: "和弓",
  skills: [shot, hardRain, overbear],
  abilities: [],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 0,
    VIT: 0,
    DEX: 30,
    AGI: 0,
    AVD: 0,
    INT: 0,
    MND: 0,
    RES: 0,
    WT: 20,
    StabResistance: 0,
    SlashResistance: 0,
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
    const validate = createValidateWearable(samuraiBow, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "和弓。威力が高い",
};
