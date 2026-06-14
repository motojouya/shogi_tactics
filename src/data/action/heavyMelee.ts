import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 王将の通常行動。近接強撃。近接の相手に攻撃2。
export const heavyMelee: Action = buildAction(
  {
    key: "heavyMelee",
    name: "近接強撃",
    description: "近接マスの相手に攻撃2",
    baseDamage: 2,
    receiverCount: 1,
    cost: 2,
    effectLength: 1,
    reachLength: 1,
  },
  effectBaseDamage,
  filterAlive,
);
