import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const downRushing: Skill = {
  name: "downRushing",
  label: "落下する滝",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 100,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "水の強魔法",
};
