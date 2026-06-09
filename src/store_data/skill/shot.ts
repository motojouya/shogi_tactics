import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage } from "../../model/skill";

export const shotAction: ActionToCharactor = (self, actor, receiver) => calcOrdinaryDirectDamage(self, actor, receiver);

export const shot: Skill = {
  name: "shot",
  label: "射る",
  action: shotAction,
  baseDamage: 90,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "弓矢の基本攻撃",
};
