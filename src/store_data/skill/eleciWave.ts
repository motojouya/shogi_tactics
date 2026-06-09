import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { paralysis } from "../status/paralysis";

export const eleciWave: Skill = {
  name: "eleciWave",
  label: "麻痺",
  action: (skill, actor, receiver) => addStatus(paralysis)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "麻痺の付与",
};
