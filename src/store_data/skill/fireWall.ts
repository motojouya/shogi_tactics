import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { magicDiffenceUp } from "../status/magicDiffenceUp";

export const fireWall: Skill = {
  name: "fireWall",
  label: "炎の壁",
  action: (skill, actor,receiver) =>
    addStatus(magicDiffenceUp)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "魔法防御up",
};
