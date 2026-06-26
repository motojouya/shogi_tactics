import type { Piece } from "../../model/piece";
import { rangedAttack, rangedSpread } from "../action/index";

// 飛車。射程の長い軽弓。通常/戦乱モードで使用。
export const rook: Piece = {
  key: "rook",
  name: "軽弓",
  shogiName: "飛車",
  description: "射程の長い軽弓。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 2,
  actions: [rangedAttack, rangedSpread],
};
