import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const stab: Skill = {
  name: "stab",
  label: "突く",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "刺突の基本攻撃",
};
