import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { acid } from "../status/acid";

export const copperBlue: Skill = {
  name: "copperBlue",
  label: "青銅",
  action: (skill, actor, receiver) => addStatus(acid)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "毒の付与",
};
