import type { Action } from "../../model/action";
import { buildAction, effectGrantStatus, filterActor } from "../../model/action";

// 金将の反動行動。迎撃体制。自分にinterception statusを付与する。
export const interceptionStance: Action = buildAction(
  {
    key: "interceptionStance",
    name: "迎撃体制",
    description: "次の自分の行動まで、受けるダメージが1減少する",
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
  effectGrantStatus("interception"),
  filterActor,
);
