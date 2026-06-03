import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_BLOW, MAGIC_TYPE_NONE } from "../../model/skill";

export const push: Skill = {
  name: "push",
  label: "押す",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryDirectDamage,
  directType: DIRECT_TYPE_BLOW,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 60,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "盾の基本攻撃",
};
