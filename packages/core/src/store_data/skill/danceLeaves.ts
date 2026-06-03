import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_WIND } from "../../model/skill";

export const danceLeaves: Skill = {
  name: "danceLeaves",
  label: "木の葉乱舞",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_WIND,
  baseDamage: 30,
  mpConsumption: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "風の範囲魔法",
};
