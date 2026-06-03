import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_WATER } from "../../model/skill";
import { getPhysical } from "../../model/charactor";

export const recover: ActionToCharactor = (self, actor, randoms, field, receiver) => {
  const physical = getPhysical(receiver);
  return {
    ...receiver,
    statuses: [...receiver.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
    hp: Math.min(receiver.hp + 150, physical.MaxHP),
  };
};

export const quench: Skill = {
  name: "quench",
  label: "恵みの雨",
  type: "SKILL_TO_CHARACTOR",
  action: recover,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_WATER,
  baseDamage: 150,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "回復",
};
