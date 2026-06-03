import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_SLASH, MAGIC_TYPE_NONE } from "../../model/skill";

export const guillotineOfGiant: Skill = {
  name: "guillotineOfGiant",
  label: "巨人の首絶ち",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_SLASH,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 150,
  mpConsumption: 30,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "斬撃の強攻撃",
};
