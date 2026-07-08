import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

export const strongSpear: Action = buildAction(
  {
    key: "strongSpear",
    name: "槍の強撃",
    description: "2マス先まで届く攻撃2(上下左右の4方のみ)",
    baseDamage: 2,
    receiverCount: 2,
    cost: 7,
    effectLength: 2,
    reachLength: 1,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 1, 1, 2, 1, 1, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
