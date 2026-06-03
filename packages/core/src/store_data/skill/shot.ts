import { getAbilities } from "../../model/charactor";
import type { Skill, ActionToCharactor } from "../../model/skill";
import { calcOrdinaryDirectDamage, calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";
import { shootingGuard } from "../ability/shootingGuard";

export const shotAction: ActionToCharactor = (self, actor, randoms, field, receiver) => {
  const abilities = getAbilities(receiver);
  if (abilities.find((ability) => ability.name === shootingGuard.name)) {
    return {
      ...receiver,
      statuses: [...receiver.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
    };
  }

  return calcOrdinaryDirectDamage(self, actor, randoms, field, receiver);
};

export const shot: Skill = {
  name: "shot",
  label: "射る",
  type: "SKILL_TO_CHARACTOR",
  action: shotAction,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 10,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "弓矢の基本攻撃",
};
