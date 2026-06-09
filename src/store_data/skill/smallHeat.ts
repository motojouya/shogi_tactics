import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const smallHeat: Skill = {
  name: "smallHeat",
  label: "黒点顕現",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 100,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "火の強魔法",
};
