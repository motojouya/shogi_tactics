import type { Piece } from "../../model/piece";
import { meleeAttack, pushAttack } from "../action/index";

// 成銀。敵を押し出す怪力士。戦乱モードで使用。
export const promotedSilver: Piece = {
  key: "promotedSilver",
  name: "怪力士",
  shogiName: "成銀",
  description: "敵を押し出す怪力士。戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, pushAttack],
};
