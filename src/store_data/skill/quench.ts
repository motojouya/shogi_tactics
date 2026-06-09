import type { Skill, ActionToCharactor } from "../../model/skill";
import { getPhysical } from "../../model/charactor";

export const recover: ActionToCharactor = (self, actor, receiver) => {
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
  action: recover,
  baseDamage: 150,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "回復",
};
