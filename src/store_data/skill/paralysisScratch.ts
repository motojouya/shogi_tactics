import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, addStatus } from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const paralysisAction: ActionToCharactor = (self, actor, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, receiver);
  return addStatus(paralysis)(self, actor, newReceiver);
};

export const paralysisScratch: Skill = {
  name: "paralysisScratch",
  label: "神経の刃",
  action: paralysisAction,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "攻撃しつつ相手を麻痺にする",
};
