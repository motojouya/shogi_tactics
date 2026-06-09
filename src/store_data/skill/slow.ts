import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { slow as slowStatus } from "../status/slow";

export const slow: Skill = {
  name: "slow",
  label: "スロウ",
  action: (skill, actor,receiver) => addStatus(slowStatus)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "スロウ付与",
};
