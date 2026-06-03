import type { Skill } from "../../model/skill";
import { addStatus, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_THUNDER } from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const eleciWave: Skill = {
  name: "eleciWave",
  label: "麻痺",
  type: "SKILL_TO_CHARACTOR",
  action: (skill, actor, randoms, field, receiver) => addStatus(paralysis)(skill, actor, randoms, field, receiver),
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_THUNDER,
  baseDamage: 0,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "麻痺の付与",
};
