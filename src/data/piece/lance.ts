import type { Piece } from "../../model/piece";
import { meleeAttack, meleeSpread } from "../action/index";

// 香車。範囲攻撃を持つ薙刀。通常/戦乱モードで使用。
export const lance: Piece = {
  key: "lance",
  name: "薙刀",
  shogiName: "香車",
  description: "範囲攻撃を持つ薙刀。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 4,
  actions: [meleeAttack, meleeSpread],
};
