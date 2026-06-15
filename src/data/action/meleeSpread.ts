import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 香車の反動行動。近接範囲。自分中心の4マス範囲に攻撃1(敵味方問わず)。
// 範囲・座標判定はstep4方針によりno-op(説明テキスト扱い)。対象はユーザーが手動選択する。
export const meleeSpread: Action = buildAction(
  {
    key: "meleeSpread",
    name: "近接範囲",
    description: "自分を中心とした4マス範囲に攻撃1。敵味方を問わない",
    baseDamage: 1,
    receiverCount: 4,
    cost: 7,
    effectLength: 2,
    reachLength: 0,
  },
  effectBaseDamage,
  filterAlive,
);
