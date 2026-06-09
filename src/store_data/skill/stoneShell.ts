import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { directDiffenceUp } from "../status/directDiffenceUp";

export const stoneShell: Skill = {
  name: "stoneShell",
  label: "亀甲岩",
  action: (skill, actor, receiver) => addStatus(directDiffenceUp)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "物理防御up",
};
