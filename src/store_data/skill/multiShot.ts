import type { Skill } from "../../model/skill";
import { shotAction } from "../skill/shot";

export const multiShot: Skill = {
  name: "multiShot",
  label: "複数射撃",
  action: shotAction,
  baseDamage: 90,
  receiverCount: 5,
  additionalWt: 150,
  effectLength: 5,
  description: "弓矢の範囲攻撃",
};
