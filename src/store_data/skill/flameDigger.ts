import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { magicDiffenceDown } from "../status/magicDiffenceDown";

export const flameDigger: Skill = {
  name: "flameDigger",
  label: "炎で穿つ",
  action: (skill, actor, receiver) => addStatus(magicDiffenceDown)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "魔法防御down",
};
