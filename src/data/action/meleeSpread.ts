import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

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
    effectRange: [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ],
    reachRange: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
