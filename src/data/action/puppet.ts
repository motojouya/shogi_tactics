import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

export const puppet: Action = buildAction(
  {
    key: "puppet",
    name: "操り人形",
    description: "近接マスの味方に通常行動をさせる。ダメージを与える対象を選択する",
    baseDamage: 1,
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
      [0, 0, 1, 2, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
