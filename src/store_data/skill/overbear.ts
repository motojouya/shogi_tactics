import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { avoidDown } from "../status/avoidDown";

export const overbear: Skill = {
  name: "overbear",
  label: "威圧",
  action: (skill, actor,receiver) => addStatus(avoidDown)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "対象の回避率を下げる",
};
