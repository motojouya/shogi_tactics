import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const chop: Skill = {
  name: "chop",
  label: "斬りつける",
  action: calcOrdinaryDirectDamage,
  baseDamage: 90,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "斬りつける",
};
