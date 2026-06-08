import type { Skill } from "../../model/skill";
import { calcOrdinaryAccuracy, DIRECT_TYPE_STAB, MAGIC_TYPE_NONE } from "../../model/skill";
import { shotAction } from "../skill/shot";

export const multiShot: Skill = {
  name: "multiShot",
  label: "複数射撃",
  type: "SKILL_TO_CHARACTOR",
  action: shotAction,
  directType: DIRECT_TYPE_STAB,
  magicType: MAGIC_TYPE_NONE,
  baseDamage: 90,
  mpConsumption: 30,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  getAccuracy: calcOrdinaryAccuracy,
  description: "弓矢の範囲攻撃",
};
