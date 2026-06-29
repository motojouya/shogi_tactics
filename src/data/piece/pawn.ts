import type { Piece } from "../../model/piece";
import { meleeAttack, healing } from "../action/index";

// 歩兵。味方を癒す薬師。戦乱モードで使用。
export const pawn: Piece = {
  key: "pawn",
  name: "薬師",
  shogiName: "歩兵",
  description: "味方を癒す薬師。戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, healing],
};
