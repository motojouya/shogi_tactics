import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ICE } from "../../model/skill";

export const hailstone: Skill = {
  name: "hailstone",
  label: "雹弾",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ICE,
  baseDamage: 30,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "氷の基本魔法",
};
