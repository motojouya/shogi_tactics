import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { directAttackDown } from "../status/directAttackDown";

export const stickyRain: Skill = {
  name: "stickyRain",
  label: "酸性雨",
  action: (skill, actor,receiver) =>
    addStatus(directAttackDown)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "物理攻撃down",
};
