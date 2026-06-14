import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 竜馬の通常行動。槍の攻撃。2マス先まで届く攻撃1(4方のみ)。
export const spearAttack: Action = buildAction(
  {
    key: "spearAttack",
    name: "槍の攻撃",
    description: "2マス先まで届く攻撃1(上下左右の4方のみ)",
    baseDamage: 1,
    receiverCount: 1,
    cost: 2,
    effectLength: 1,
    reachLength: 2,
  },
  effectBaseDamage,
  filterAlive,
);
