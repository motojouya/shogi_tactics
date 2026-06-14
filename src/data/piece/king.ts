import type { Piece } from "../../model/piece";
import { heavyMelee, kingsBlow } from "../action/index";

// 王将。倒されると敗北する全軍の要。通常/戦乱モードで使用。
export const king: Piece = {
  key: "king",
  name: "将軍",
  description: "倒されると敗北する全軍の要。通常/戦乱モードで使用",
  MaxHP: 2,
  move: 3,
  actions: [heavyMelee, kingsBlow],
};
