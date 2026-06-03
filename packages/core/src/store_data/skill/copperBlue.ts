import type { Skill } from "../../model/skill";
import { addStatus, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ROCK } from "../../model/skill";
import { acid } from "../status/acid";

export const copperBlue: Skill = {
  name: "copperBlue",
  label: "青銅",
  type: "SKILL_TO_CHARACTOR",
  action: (skill, actor, randoms, field, receiver) => addStatus(acid)(skill, actor, randoms, field, receiver),
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ROCK,
  baseDamage: 0,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "毒の付与",
};
