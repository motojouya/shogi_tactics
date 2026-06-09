import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const gravelWall: Skill = {
  name: "gravelWall",
  label: "礫の壁",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 4,
  additionalWt: 150,
  effectLength: 1,
  description: "打撃の範囲攻撃",
};
