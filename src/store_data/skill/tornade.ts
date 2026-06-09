import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const tornade: Skill = {
  name: "tornade",
  label: "大竜巻",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 100,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "風の強魔法",
};
