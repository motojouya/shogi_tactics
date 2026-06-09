import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const windEdge: Skill = {
  name: "windEdge",
  label: "辻風",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "風の基本魔法",
};
