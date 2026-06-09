import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const gunWater: Skill = {
  name: "gunWater",
  label: "水鉄砲",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "水の基本魔法",
};
