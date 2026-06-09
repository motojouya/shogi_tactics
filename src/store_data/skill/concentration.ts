import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { accuracyUp } from "../status/accuracyUp";

export const concentration: Skill = {
  name: "concentration",
  label: "精神集中",
  action: (skill, actor, receiver) => addStatus(accuracyUp)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "対象の攻撃命中率をあげる",
};
