import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const swordDance: Skill = {
  name: "swordDance",
  label: "剣の舞",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 4,
  additionalWt: 150,
  effectLength: 1,
  description: "斬撃の範囲攻撃",
};
