import type { Skill } from "../../model/skill";
import { shotAction } from "../skill/shot";

export const hardRain: Skill = {
  name: "hardRain",
  label: "堅い雨",
  action: shotAction,
  baseDamage: 150,
  receiverCount: 1,
  additionalWt: 150,
  effectLength: 5,
  description: "弓矢の強攻撃",
};
