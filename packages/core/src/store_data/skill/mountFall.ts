import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ROCK } from "../../model/skill";

export const mountFall: Skill = {
  name: "mountFall",
  label: "落下する山",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ROCK,
  baseDamage: 100,
  mpConsumption: 30,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "岩の強魔法",
};
