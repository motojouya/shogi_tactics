import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { accuracyDown } from "../status/accuracyDown";

export const dazzle: Skill = {
  name: "dazzle",
  label: "幻惑",
  action: (skill, actor,receiver) => addStatus(accuracyDown)(skill, actor,receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "対象の攻撃命中率を下げる",
};
