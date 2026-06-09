import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, addStatus } from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const paralysisAction: ActionToCharactor = (self, actor, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, receiver);
  return addStatus(paralysis)(self, actor, newReceiver);
};

export const paralysisShot: Skill = {
  name: "paralysisShot",
  label: "神経の矢",
  action: paralysisAction,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "攻撃しつつ相手を麻痺にする",
};
