import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";

export const saturnRing: Skill = {
  name: "saturnRing",
  label: "土星の輪",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 30,
  receiverCount: 4,
  additionalWt: 150,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "刺突の範囲攻撃",
};
