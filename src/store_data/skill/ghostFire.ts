import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { fear } from "../status/fear";

export const ghostFire: Skill = {
  name: "ghostFire",
  label: "鬼火",
  action: (skill, actor,receiver) => addStatus(fear)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "恐怖の付与",
};
