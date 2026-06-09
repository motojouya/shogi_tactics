import type { Skill } from "../../model/skill";
import { addStatus } from "../../model/skill";
import { silent as silentStatus } from "../status/silent";

export const silent: Skill = {
  name: "silent",
  label: "音食う雪",
  action: (skill, actor, receiver) => addStatus(silentStatus)(skill, actor, receiver),
  baseDamage: 0,
  receiverCount: 1,
  additionalWt: 100,
  effectLength: 5,
  description: "沈黙の付与",
};
