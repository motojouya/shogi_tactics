import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_WATER } from "../../model/skill";

export const flashFlood: Skill = {
  name: "flashFlood",
  label: "鉄砲水",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_WATER,
  baseDamage: 30,
  mpConsumption: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "水の範囲魔法",
};
