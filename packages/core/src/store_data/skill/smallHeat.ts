import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_FIRE } from "../../model/skill";

export const smallHeat: Skill = {
  name: "smallHeat",
  label: "黒点顕現",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_FIRE,
  baseDamage: 100,
  mpConsumption: 30,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "火の強魔法",
};
