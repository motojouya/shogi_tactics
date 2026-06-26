import type { Piece } from "../../model/piece";
import { meleeAttack, barricade } from "../action/index";

// 成桂。防柵を築く工兵。戦乱モードで使用。
export const promotedKnight: Piece = {
  key: "promotedKnight",
  name: "工兵",
  shogiName: "成桂",
  description: "防柵を築く工兵。戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, barricade],
};
