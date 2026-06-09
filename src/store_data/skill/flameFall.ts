import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const flameFall: Skill = {
  name: "flameFall",
  label: "Flame Fall",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "基本魔法",
};
