import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 通常行動。近接の敵単体に攻撃1。多くの駒の通常行動として共有する。
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
  },
  effectBaseDamage,
  filterAlive,
);
