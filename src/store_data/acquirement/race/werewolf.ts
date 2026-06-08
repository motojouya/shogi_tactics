import type { Race } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";

export const werewolf: Race = {
  name: "werewolf",
  label: "ワーウルフ",
  skills: [],
  abilities: [],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 10,
    VIT: 0,
    DEX: 0,
    AGI: 10,
    AVD: 10,
    INT: -10,
    MND: 0,
    RES: 0,
    WT: -5,
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
    const validate = createValidateWearable(werewolf, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "ワーウルフ。物理攻撃力が高い。",
};
