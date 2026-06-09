import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, addStatus } from "../../model/skill";
import { acid } from "../status/acid";

export const toxicAction: ActionToCharactor = (self, actor, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, receiver);
  return addStatus(acid)(self, actor, newReceiver);
};

export const toxicScratch: Skill = {
  name: "toxicScratch",
  label: "毒の刃",
  action: toxicAction,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  description: "攻撃しつつ相手を毒にする",
};
