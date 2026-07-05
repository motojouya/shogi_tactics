import type { Action } from "../../model/action";
import { buildAction, effectHeal, filterAlive } from "../../model/action";

export const healing: Action = buildAction(
  {
    key: "healing",
    name: "回復処方",
    description: "近接マスの味方の体力を最大まで回復する",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
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
      [0, 0, 1, 3, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectHeal,
  filterAlive,
);
