import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ICE } from "../../model/skill";

export const iceSandwich: Skill = {
  name: "iceSandwich",
  label: "左右の氷",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ICE,
  baseDamage: 30,
  mpConsumption: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "氷の範囲魔法",
};
