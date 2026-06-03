import type { Skill } from "../../model/skill";
import { addStatus, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ICE } from "../../model/skill";
import { slow as slowStatus } from "../status/slow";

export const slow: Skill = {
  name: "slow",
  label: "スロウ",
  type: "SKILL_TO_CHARACTOR",
  action: (skill, actor, randoms, field, receiver) => addStatus(slowStatus)(skill, actor, randoms, field, receiver),
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ICE,
  baseDamage: 0,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "スロウ付与",
};
