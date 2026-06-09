import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { magicAttackUp } from "../status/magicAttackUp";

export const electoricBrain: Skill = {
  name: "electoricBrain",
  label: "電脳",
  action: (skill, actor,receiver) => addStatus(magicAttackUp)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "魔法攻撃up",
};
