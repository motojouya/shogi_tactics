import type { Skill, ActionToCharactor } from "../../model/skill";
import {
  calcOrdinaryDirectDamage,
  addStatus,
  calcOrdinaryAccuracy,
  DIRECT_TYPE_STAB,
  MAGIC_TYPE_NONE,
} from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const paralysisAction: ActionToCharactor = (self, actor, randoms,receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, randoms,receiver);
  return addStatus(paralysis)(self, actor, randoms,newReceiver);
};

export const paralysisShot: Skill = {
  name: "paralysisShot",
  label: "神経の矢",
  type: "SKILL_TO_CHARACTOR",
  action: paralysisAction,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 60,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "攻撃しつつ相手を麻痺にする",
};
