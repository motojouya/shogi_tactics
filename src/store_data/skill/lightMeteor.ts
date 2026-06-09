import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const lightMeteor: Skill = {
  name: "lightMeteor",
  label: "軽量隕石",
  action: calcOrdinaryDirectDamage,
  baseDamage: 150,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 1,
  description: "",
};
