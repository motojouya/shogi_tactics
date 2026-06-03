import type { Skill } from "../../model/skill";
import {
  calcOrdinaryMagicalDamage,
  calcOrdinaryAccuracy,
  DIRECT_TYPE_NONE,
  MAGIC_TYPE_THUNDER,
} from "../../model/skill";

export const higherBolt: Skill = {
  name: "higherBolt",
  label: "高圧電流",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_THUNDER,
  baseDamage: 30,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "雷の基本魔法",
};
