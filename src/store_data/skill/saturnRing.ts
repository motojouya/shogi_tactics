import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const saturnRing: Skill = {
  name: "saturnRing",
  label: "土星の輪",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 4,
  additionalWt: 150,
  effectLength: 1,
  description: "刺突の範囲攻撃",
};
