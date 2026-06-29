import type { Piece } from "../../model/piece";
import { rangedAttack, strongRanged } from "../action/index";

// 角行。火力の高い強弓。通常/戦乱モードで使用。
export const bishop: Piece = {
  key: "bishop",
  name: "強弓",
  shogiName: "角行",
  description: "火力の高い強弓。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 2,
  actions: [rangedAttack, strongRanged],
};
