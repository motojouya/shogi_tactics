import type { Piece } from "../../model/piece";
import { meleeAttack, puppet } from "../action/index";

// 成香。味方を操る傀儡師。戦乱モードで使用。
export const promotedLance: Piece = {
  key: "promotedLance",
  name: "傀儡師",
  description: "味方を操る傀儡師。戦乱モードで使用",
  MaxHP: 2,
  move: 3,
  actions: [meleeAttack, puppet],
};
