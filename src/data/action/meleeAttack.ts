import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

export const meleeAttack: Action = buildAction(
  {
    key: "meleeAttack",
    name: "近接攻撃",
    description: "近接マスの相手に攻撃1",
    baseDamage: 1,
    receiverCount: 1,
    cost: 2,
    effectLength: 1,
    reachLength: 1,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 2, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
