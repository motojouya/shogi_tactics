import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, addStatus } from "../../model/skill";
import { silent } from "../status/silent";

export const silentAction: ActionToCharactor = (self, actor, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, receiver);
  return addStatus(silent)(self, actor, newReceiver);
};

export const silentShot: Skill = {
  name: "silentShot",
  label: "沈黙の矢",
  action: silentAction,
  baseDamage: 60,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "攻撃しつつ相手を沈黙にする",
};
