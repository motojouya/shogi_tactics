import type { Skill } from "../../model/skill";
import { addStatus, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_FIRE } from "../../model/skill";
import { magicDiffenceUp } from "../status/magicDiffenceUp";

export const fireWall: Skill = {
  name: "fireWall",
  label: "炎の壁",
  type: "SKILL_TO_CHARACTOR",
  action: (skill, actor, randoms, field, receiver) =>
    addStatus(magicDiffenceUp)(skill, actor, randoms, field, receiver),
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_FIRE,
  baseDamage: 0,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "魔法防御up",
};
