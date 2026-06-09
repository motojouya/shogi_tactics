import type { Skill } from "../../model/skill";
import {
  calcOrdinaryMagicalDamage,
} from "../../model/skill";

export const higherBolt: Skill = {
  name: "higherBolt",
  label: "高圧電流",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "雷の基本魔法",
};
