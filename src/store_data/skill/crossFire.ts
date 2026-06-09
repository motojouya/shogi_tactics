import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const crossFire: Skill = {
  name: "crossFire",
  label: "交差する炎",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "火の範囲魔法",
};
