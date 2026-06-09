import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const frostbite: Skill = {
  name: "frostbite",
  label: "凍傷",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 100,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "氷の強魔法",
};
