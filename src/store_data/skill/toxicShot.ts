import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, addStatus } from "../../model/skill";
import { acid } from "../status/acid";

export const toxicAction: ActionToCharactor = (self, actor, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, receiver);
  return addStatus(acid)(self, actor, newReceiver);
};

export const toxicShot: Skill = {
  name: "toxicShot",
  label: "毒の矢",
  action: toxicAction,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "攻撃しつつ相手を毒にする",
};
