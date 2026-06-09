import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const iceSandwich: Skill = {
  name: "iceSandwich",
  label: "左右の氷",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "氷の範囲魔法",
};
