import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { directAttackUp } from "../status/directAttackUp";

export const waterCutter: Skill = {
  name: "waterCutter",
  label: "水刃の鎖",
  action: (skill, actor,receiver) => addStatus(directAttackUp)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "物理攻撃up",
};
