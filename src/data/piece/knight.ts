import type { Piece } from "../../model/piece";
import { meleeAttack, chargeMelee } from "../action/index";

// 桂馬。機動力に優れた騎馬。通常/戦乱モードで使用。
export const knight: Piece = {
  key: "knight",
  name: "騎馬",
  shogiName: "桂馬",
  description: "機動力に優れた騎馬。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 4,
  actions: [meleeAttack, chargeMelee],
};
