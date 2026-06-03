import type { Weapon } from "../../../model/acquirement";
import { createValidateWearable } from "../../../model/acquirement";
import { chop } from "../../skill/chop";
import { dazzle } from "../../skill/dazzle";
import { higherBolt } from "../../skill/higherBolt";
import { rampartForce } from "../../ability/rampartForce";

export const amethystSaber: Weapon = {
  name: "amethystSaber",
  label: "アメジストサーベル",
  skills: [chop, higherBolt, dazzle],
  abilities: [rampartForce],
  additionalPhysical: {
    MaxHP: 0,
    MaxMP: 0,
    STR: 0,
    VIT: 0,
    DEX: 20,
    AGI: 0,
    AVD: 0,
    INT: 10,
    MND: 0,
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
    ThunderSuitable: 10,
    move: 0,
    jump: 0,
  },
  validateWearable: (race, blessing, clothing, weapon) => {
    const validate = createValidateWearable(amethystSaber, {
      wearableRaces: [],
      wearableBlessings: [],
      wearableClothings: [],
      wearableWeapons: [],
    });
    return validate(race, blessing, clothing, weapon);
  },
  description: "アメジストサーベル。雷属性",
};
