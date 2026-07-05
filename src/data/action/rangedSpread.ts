import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

export const rangedSpread: Action = buildAction(
  {
    key: "rangedSpread",
    name: "遠隔範囲",
    description: "2マス先を中心とした5マス範囲に攻撃1。敵味方を問わない",
    baseDamage: 1,
    receiverCount: 5,
    cost: 7,
    effectLength: 2,
    reachLength: 2,
    effectRange: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    reachRange: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 2, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
