import type { Status } from "./status";
import type { SelectOption } from "../io/dialogue";
import type { Physical } from "./physical";
import type { Race, Weapon, Clothing, Blessing } from "./acquirement";
import type { Ability } from "./ability";
import type { Skill } from "./skill";

import { addPhysicals } from "./physical";
import { NotWearableErorr } from "./acquirement";

const basePhysical: Physical = {
  MaxHP: 300,
  MaxMP: 200,
  STR: 100,
  VIT: 100,
  DEX: 100,
  AGI: 100,
  AVD: 100,
  INT: 100,
  MND: 100,
  RES: 100,
  WT: 100,
  StabResistance: 0,
  SlashResistance: 0,
  BlowResistance: 0,
  FireSuitable: 0,
  RockSuitable: 0,
  WaterSuitable: 0,
  IceSuitable: 0,
  AirSuitable: 0,
  ThunderSuitable: 0,
  move: 4,
  jump: 3,
};

export type AttachedStatus = {
  status: Status;
  restWt: number;
};

export type Charactor = {
  name: string;
  weapon: Weapon;
  clothing: Clothing;
  blessing: Blessing;
  race: Race;
};

export type CharactorBattling = Charactor & {
  statuses: AttachedStatus[];
  hp: number;
  mp: number;
  restWt: number;
  isVisitor: boolean;
};

export type CopyAttachedStatus = (attachedStatus: AttachedStatus) => AttachedStatus;
export const copyAttachedStatus: CopyAttachedStatus = (attachedStatus) => ({ ...attachedStatus });

export type CopyCharactor = (charactor: Charactor) => Charactor;
export const copyCharactor: CopyCharactor = (charactor) => ({ ...charactor });

export type CopyCharactorBattling = (charactor: CharactorBattling) => CharactorBattling;
export const copyCharactorBattling: CopyCharactorBattling = (charactor) => ({
  ...charactor,
  statuses: charactor.statuses.map(copyAttachedStatus),
});

export function isBattling(charctor: Charactor): charctor is CharactorBattling {
  return (
    "statuses" in charctor && "hp" in charctor && "mp" in charctor && "restWt" in charctor && "isVisitor" in charctor
  );
}

export type GetSelectOption = (charactor: CharactorBattling) => SelectOption;
export const getSelectOption: GetSelectOption = (charactor) => ({
  label: `${charactor.isVisitor ? "V" : "H"}:${charactor.name}`,
  value: `${charactor.isVisitor ? "V" : "H"}:${charactor.name}`,
});

export type SelectCharactor = (candidates: CharactorBattling[], values: string[]) => CharactorBattling[];
export const selectCharactor: SelectCharactor = (candidates, values) =>
  candidates.filter((candidate) => values.includes(`${candidate.isVisitor ? "V" : "H"}:${candidate.name}`));

export type GetAbilities = (charactor: Charactor) => Ability[];
export const getAbilities: GetAbilities = (charactor) => [
  ...charactor.race.abilities,
  ...charactor.blessing.abilities,
  ...charactor.clothing.abilities,
  ...charactor.weapon.abilities,
];

export type GetSkills = (charactor: Charactor) => Skill[];
export const getSkills: GetSkills = (charactor) => [
  ...charactor.race.skills,
  ...charactor.blessing.skills,
  ...charactor.clothing.skills,
  ...charactor.weapon.skills,
];

export type GetPhysical = (charactor: Charactor) => Physical;
export const getPhysical: GetPhysical = (charactor) =>
  addPhysicals([
    basePhysical,
    charactor.race.additionalPhysical,
    charactor.blessing.additionalPhysical,
    charactor.clothing.additionalPhysical,
    charactor.weapon.additionalPhysical,
  ]);

export type Validate = (
  name: string,
  race: Race,
  blessing: Blessing,
  clothing: Clothing,
  weapon: Weapon,
) => NotWearableErorr | null;
export const validate: Validate = (name, race, blessing, clothing, weapon) => {
  const raceResult = race.validateWearable(race, blessing, clothing, weapon);
  if (raceResult instanceof NotWearableErorr) {
    return raceResult;
  }

  const blessingResult = blessing.validateWearable(race, blessing, clothing, weapon);
  if (blessingResult instanceof NotWearableErorr) {
    return blessingResult;
  }

  const clothingResult = clothing.validateWearable(race, blessing, clothing, weapon);
  if (clothingResult instanceof NotWearableErorr) {
    return clothingResult;
  }

  const weaponResult = weapon.validateWearable(race, blessing, clothing, weapon);
  if (weaponResult instanceof NotWearableErorr) {
    return weaponResult;
  }

  return null;
};

export type toBattleCharactor = (charactor: Charactor, isVisitor: boolean) => CharactorBattling;
export const toBattleCharactor: toBattleCharactor = (charactor, isVisitor) => {
  const physical = getPhysical(charactor);
  return {
    ...copyCharactor(charactor),
    statuses: [],
    hp: physical.MaxHP,
    mp: 0,
    restWt: physical.WT,
    isVisitor: isVisitor,
  };
};

export type CreateCharactor = (
  name: string,
  race: Race,
  blessing: Blessing,
  clothing: Clothing,
  weapon: Weapon,
) => Charactor | NotWearableErorr;
export const createCharactor: CreateCharactor = (name, race, blessing, clothing, weapon) => {
  const validateResult = validate(name, race, blessing, clothing, weapon);
  if (validateResult instanceof NotWearableErorr) {
    return validateResult;
  }

  return {
    name,
    race,
    blessing,
    clothing,
    weapon,
  };
};

export type IsVisitorString = (isVisitor: boolean) => string;
export const isVisitorString: IsVisitorString = (isVisitor) => (isVisitor ? "VISITOR" : "HOME");
