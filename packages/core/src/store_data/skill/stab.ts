import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";

export const stab: Skill = {
  name: "stab",
  label: "突く",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "刺突の基本攻撃",
};
