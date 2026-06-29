import type { Piece } from "../../model/piece";
import { meleeAttack, substitute } from "../action/index";

// と金。身代わりとなる祈禱師。戦乱モードで使用。
export const promotedPawn: Piece = {
  key: "promotedPawn",
  name: "祈禱師",
  shogiName: "と金",
  description: "身代わりとなる祈禱師。戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, substitute],
};
