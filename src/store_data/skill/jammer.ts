import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { magicAttackDown } from "../status/magicAttackDown";

export const jammer: Skill = {
  name: "jammer",
  label: "妨害魔法",
  action: (skill, actor,receiver) =>
    addStatus(magicAttackDown)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "魔法攻撃down",
};
