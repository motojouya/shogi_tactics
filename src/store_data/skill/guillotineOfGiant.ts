import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const guillotineOfGiant: Skill = {
  name: "guillotineOfGiant",
  label: "巨人の首絶ち",
  action: calcOrdinaryDirectDamage,
  baseDamage: 150,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 1,
  description: "斬撃の強攻撃",
};
