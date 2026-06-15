import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 通常行動。3マス先までの相手に攻撃1。飛車/角行/竜王の通常行動として共有する。
export const rangedAttack: Action = buildAction(
  {
    key: "rangedAttack",
    name: "遠隔攻撃",
    description: "3マス先までの相手に攻撃1",
    baseDamage: 1,
    receiverCount: 1,
    cost: 2,
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
