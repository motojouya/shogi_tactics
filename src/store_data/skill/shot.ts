import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";

export const shotAction: ActionToCharactor = (self, actor, receiver) => calcOrdinaryDirectDamage(self, actor, receiver);

export const shot: Skill = {
  name: "shot",
  label: "射る",
  type: "SKILL_TO_CHARACTOR",
  action: shotAction,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "弓矢の基本攻撃",
};
