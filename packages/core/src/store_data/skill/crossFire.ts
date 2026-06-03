import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_FIRE } from "../../model/skill";

export const crossFire: Skill = {
  name: "crossFire",
  label: "交差する炎",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_FIRE,
  baseDamage: 30,
  mpConsumption: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "火の範囲魔法",
};
