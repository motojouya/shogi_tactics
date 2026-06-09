import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const flashFlood: Skill = {
  name: "flashFlood",
  label: "鉄砲水",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "水の範囲魔法",
};
