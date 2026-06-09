import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const push: Skill = {
  name: "push",
  label: "押す",
  action: calcOrdinaryDirectDamage,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "盾の基本攻撃",
};
