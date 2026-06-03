import type { Skill } from "../../model/skill";
import {
  calcOrdinaryMagicalDamage,
  calcOrdinaryAccuracy,
  DIRECT_TYPE_NONE,
  MAGIC_TYPE_THUNDER,
} from "../../model/skill";

export const thunder: Skill = {
  name: "thunder",
  label: "神の鳴り物",
  type: "SKILL_TO_CHARACTOR",
  action: calcOrdinaryMagicalDamage,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_THUNDER,
  baseDamage: 100,
  mpConsumption: 30,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "雷の強魔法",
};
