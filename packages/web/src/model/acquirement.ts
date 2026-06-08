import type { Ability } from "./ability";
import type { Physical } from "./physical";
import type { Skill } from "./skill";

export type Acquirement = {
  name: string;
  label: string;
  skills: Skill[];
  abilities: Ability[];
  additionalPhysical: Physical;
  validateWearable: ValidateWearable;
  description: string;
};

export type ValidateWearable = (
  race: Race | null,
  weapon: Weapon | null,
  clothing: Clothing | null,
  blessing: Blessing | null,
) => null | NotWearableErorr;

export type Race = Acquirement;
export type Weapon = Acquirement;
export type Clothing = Acquirement;
export type Blessing = Acquirement;

export class NotWearableErorr {
  constructor(
    readonly acquirement: Acquirement,
    readonly cause: Acquirement,
    readonly message: string,
  ) {}
}

export type CreateValidateWearable = (
  self: Acquirement,
  wearableAcquirements: {
    wearableRaces: string[];
    wearableBlessings: string[];
    wearableClothings: string[];
    wearableWeapons: string[];
  },
) => ValidateWearable;
export const createValidateWearable: CreateValidateWearable =
  (self, { wearableRaces, wearableBlessings, wearableClothings, wearableWeapons }) =>
  (race, blessing, clothing, weapon) => {
    if (wearableRaces.length > 0 && !!race) {
      const raceWearable = wearableRaces.includes(race.name);
      if (!raceWearable) {
        return new NotWearableErorr(self, race, `このキャラクターの設定では${self.name}を装備できません`);
      }
    }

    if (wearableBlessings.length > 0 && !!blessing) {
      const blessingWearable = wearableBlessings.includes(blessing.name);
      if (!blessingWearable) {
        return new NotWearableErorr(self, blessing, `このキャラクターの設定では${self.name}を装備できません`);
      }
    }

    if (wearableClothings.length > 0 && !!clothing) {
      const clothingWearable = wearableClothings.includes(clothing.name);
      if (!clothingWearable) {
        return new NotWearableErorr(self, clothing, `このキャラクターの設定では${self.name}を装備できません`);
      }
    }

    if (wearableWeapons.length > 0 && !!weapon) {
      const weaponWearable = wearableWeapons.includes(weapon.name);
      if (!weaponWearable) {
        return new NotWearableErorr(self, weapon, `このキャラクターの設定では${self.name}を装備できません`);
      }
    }

    return null;
  };
