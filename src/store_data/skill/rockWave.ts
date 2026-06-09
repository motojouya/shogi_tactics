import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const rockWave: Skill = {
  name: "rockWave",
  label: "岩波",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "岩の範囲魔法",
};
