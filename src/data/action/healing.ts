import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 歩兵の反動行動。回復処方。近接マスの味方の体力を最大まで回復する。
// 回復効果はstep4で実装する。現状はbaseDamage0のno-op。
export const healing: Action = buildAction(
  {
    key: "healing",
    name: "回復処方",
    description: "近接マスの味方の体力を最大まで回復する",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 1,
  },
  effectBaseDamage,
  filterAlive,
);
