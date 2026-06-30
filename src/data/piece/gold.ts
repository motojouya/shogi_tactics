import type { Piece } from "../../model/piece";
import { meleeAttack, interceptionStance } from "../action/index";

export const gold: Piece = {
  key: "gold",
  name: "重装兵",
  shogiName: "金将",
  description: "前線を支える重装兵。技能「足止め」で敵の近接マス通過を停止させる。通常/戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [meleeAttack, interceptionStance],
};
