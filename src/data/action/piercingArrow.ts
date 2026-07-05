import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

export const piercingArrow: Action = buildAction(
  {
    key: "piercingArrow",
    name: "貫通弓矢",
    description: "直線5マスを貫通して攻撃1",
    baseDamage: 1,
    receiverCount: 5,
    cost: 7,
    effectLength: 5,
    reachLength: 5,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
