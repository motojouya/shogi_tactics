import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_SLASH, MAGIC_TYPE_NONE } from "../../model/skill";

export const swordDance: Skill = {
  name: "swordDance",
  label: "剣の舞",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_SLASH,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 30,
  receiverCount: 4,
  additionalWt: 150,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "斬撃の範囲攻撃",
};
