import type { Action } from "../../model/action";
import { buildAction, effectGrantStatus, filterActor } from "../../model/action";

// 銀将の反動行動。矢かわし。自分にarrowDodge statusを付与する。
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
  },
  effectGrantStatus("arrowDodge"),
  filterActor,
);
