import type { Action } from "../../model/action";
import { buildAction, effectGrantStatus, filterActor } from "../../model/action";
import { arrowDodge } from "../status";

export const arrowDodgeStance: Action = buildAction(
  {
    key: "arrowDodgeStance",
    name: "矢かわし",
    description: "次の自分の行動まで、近接マス以外からの攻撃が無効になる",
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
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectGrantStatus(arrowDodge.key),
  filterActor,
);
