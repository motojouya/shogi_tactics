import type { Skill } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const pitch: Skill = {
  name: "pitch",
  label: "投げる",
  action: calcOrdinaryDirectDamage,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "投げる",
};
