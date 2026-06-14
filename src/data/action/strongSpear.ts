import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 竜馬の反動行動。槍の強撃。2マス先まで届く攻撃2(4方のみ)。
export const strongSpear: Action = buildAction(
  {
    key: "strongSpear",
    name: "槍の強撃",
    description: "2マス先まで届く攻撃2(上下左右の4方のみ)",
    baseDamage: 2,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 2,
  },
  effectBaseDamage,
  filterAlive,
);
