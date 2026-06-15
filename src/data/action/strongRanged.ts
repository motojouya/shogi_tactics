import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 角行の反動行動。遠隔強撃。3マス先までの相手に攻撃2。
export const strongRanged: Action = buildAction(
  {
    key: "strongRanged",
    name: "遠隔強撃",
    description: "3マス先までの相手に攻撃2",
    baseDamage: 2,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 3,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 2, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
