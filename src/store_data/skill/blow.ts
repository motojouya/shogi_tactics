import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const blow: Skill = {
  name: "blow",
  label: "殴る",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "打撃攻撃",
};
