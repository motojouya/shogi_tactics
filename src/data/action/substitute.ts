import type { Action } from "../../model/action";
import { buildAction, effectOverHeal, filterAlive } from "../../model/action";

// と金の反動行動。身代わり。対象の体力を1回復する(体力の限界を超えて追加できる)。
export const substitute: Action = buildAction(
  {
    key: "substitute",
    name: "身代わり",
    description: "体力を1回復する。体力の限界を超えて追加できる",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 0,
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
  effectOverHeal,
  filterAlive,
);
