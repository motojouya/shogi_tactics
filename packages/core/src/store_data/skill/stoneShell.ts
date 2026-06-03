import type { Skill } from "../../model/skill";
import { addStatus, calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ROCK } from "../../model/skill";
import { directDiffenceUp } from "../status/directDiffenceUp";

export const stoneShell: Skill = {
  name: "stoneShell",
  label: "亀甲岩",
  type: "SKILL_TO_CHARACTOR",
  action: (skill, actor, randoms, field, receiver) =>
    addStatus(directDiffenceUp)(skill, actor, randoms, field, receiver),
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ROCK,
  baseDamage: 0,
  mpConsumption: 15,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "物理防御up",
};
