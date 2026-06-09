import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { sleep } from "../status/sleep";

export const heavyWind: Skill = {
  name: "heavyWind",
  label: "春の暁",
  action: (skill, actor,receiver) => addStatus(sleep)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "眠りの付与",
};
