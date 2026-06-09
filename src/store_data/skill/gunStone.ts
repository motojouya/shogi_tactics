import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const gunStone: Skill = {
  name: "gunStone",
  label: "石弾",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "岩の基本魔法",
};
