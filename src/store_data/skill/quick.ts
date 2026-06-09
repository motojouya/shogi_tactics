import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { quick as quickStatus } from "../status/quick";

export const quick: Skill = {
  name: "quick",
  label: "クイック",
  action: (skill, actor, receiver) => addStatus(quickStatus)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "クイック状態の付与",
};
