import type { Skill } from "../../model/skill";
import {
  calcOrdinaryMagicalDamage,
} from "../../model/skill";

export const electricShock: Skill = {
  name: "electricShock",
  label: "広がる雷",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "雷の範囲魔法",
};
