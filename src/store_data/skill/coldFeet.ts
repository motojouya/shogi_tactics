import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { avoidUp } from "../status/avoidUp";

export const coldFeet: Skill = {
  name: "coldFeet",
  label: "逃げ腰",
  action: (skill, actor, receiver) => addStatus(avoidUp)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "対象の回避率をあげる",
};
