import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 飛車の反動行動。遠隔範囲。2マス先までを着地点とし、着地点中心5マス範囲に攻撃1(敵味方問わず)。
// 範囲・座標判定はstep4方針によりno-op(説明テキスト扱い)。対象はユーザーが手動選択する。
export const rangedSpread: Action = buildAction(
  {
    key: "rangedSpread",
    name: "遠隔範囲",
    description: "2マス先を中心とした5マス範囲に攻撃1。敵味方を問わない",
    baseDamage: 1,
    receiverCount: 5,
    cost: 7,
    effectLength: 5,
    reachLength: 2,
  },
  effectBaseDamage,
  filterAlive,
);
