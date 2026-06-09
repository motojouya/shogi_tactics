import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { directDiffenceDown } from "../status/directDiffenceDown";

export const stoneWeather: Skill = {
  name: "stoneWeather",
  label: "風化",
  action: (skill, actor, receiver) => addStatus(directDiffenceDown)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "物理防御down",
};
