import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const blindBull: Skill = {
  name: "blindBull",
  label: "盲牛の突き",
  action: calcOrdinaryDirectDamage,
  baseDamage: 150,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 1,
  description: "刺突の強攻撃",
};
