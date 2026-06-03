import type { Skill, ActionToCharactor } from "../../model/skill";
import {
  calcOrdinaryDirectDamage,
  addStatus,
  calcOrdinaryAccuracy,
  DIRECT_TYPE_STAB,
  MAGIC_TYPE_NONE,
} from "../../model/skill";
import { silent } from "../status/silent";

export const silentAction: ActionToCharactor = (self, actor, randoms, field, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, randoms, field, receiver);
  return addStatus(silent)(self, actor, randoms, field, newReceiver);
};

export const silentShot: Skill = {
  name: "silentShot",
  label: "沈黙の矢",
  type: "SKILL_TO_CHARACTOR",
  action: silentAction,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 60,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "攻撃しつつ相手を沈黙にする",
};
