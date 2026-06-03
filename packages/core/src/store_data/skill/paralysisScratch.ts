import type { Skill, ActionToCharactor } from "../../model/skill";
import {
  calcOrdinaryDirectDamage,
  addStatus,
  calcOrdinaryAccuracy,
  DIRECT_TYPE_SLASH,
  MAGIC_TYPE_NONE,
} from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const paralysisAction: ActionToCharactor = (self, actor, randoms, field, receiver) => {
  const newReceiver = calcOrdinaryDirectDamage(self, actor, randoms, field, receiver);
  return addStatus(paralysis)(self, actor, randoms, field, newReceiver);
};

export const paralysisScratch: Skill = {
  name: "paralysisScratch",
  label: "神経の刃",
  type: "SKILL_TO_CHARACTOR",
  action: paralysisAction,
  directType: DIRECT_TYPE_SLASH,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 60,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 1,
  getAccuracy: calcOrdinaryAccuracy,
  description: "攻撃しつつ相手を麻痺にする",
};
