import type { Piece } from "../../model/piece";
import { rangedAttack, piercingArrow } from "../action/index";

// 竜王。貫通射撃を放つ与一。戦乱モードで使用。
export const dragon: Piece = {
  key: "dragon",
  name: "与一",
  description: "貫通射撃を放つ与一。戦乱モードで使用",
  MaxHP: 3,
  move: 2,
  actions: [rangedAttack, piercingArrow],
};
