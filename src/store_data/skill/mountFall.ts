import type { Skill } from "../../model/skill";
import { calcOrdinaryMagicalDamage } from "../../model/skill";

export const mountFall: Skill = {
  name: "mountFall",
  label: "落下する山",
  action: calcOrdinaryMagicalDamage,
  baseDamage: 100,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "岩の強魔法",
};
