import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";

export const blindBull: Skill = {
  name: "blindBull",
  label: "盲牛の突き",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 150,
  mpConsumption: 30,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "刺突の強攻撃",
};
