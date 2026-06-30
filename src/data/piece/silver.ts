import type { Piece } from "../../model/piece";
import { meleeAttack, arrowDodgeStance } from "../action/index";

export const silver: Piece = {
  key: "silver",
  name: "野伏",
  shogiName: "銀将",
  description: "回避に長けた野伏。技能「足止め」で敵の近接マス通過を停止させる。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, arrowDodgeStance],
};
