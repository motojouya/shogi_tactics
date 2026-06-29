import type { Piece } from "../../model/piece";
import { spearAttack, strongSpear } from "../action/index";

// 竜馬。槍の間合いを持つ宝蔵院。技能「足止め」(敵の近接マス通過を停止させる)を持つ。戦乱モードで使用。
export const horse: Piece = {
  key: "horse",
  name: "宝蔵院",
  shogiName: "竜馬",
  description: "槍の間合いを持つ宝蔵院。技能「足止め」で敵の近接マス通過を停止させる。戦乱モードで使用",
  MaxHP: 3,
  move: 3,
  actions: [spearAttack, strongSpear],
};
