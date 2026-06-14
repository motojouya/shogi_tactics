import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 成香の反動行動。操り人形。近接マスの味方に通常行動をさせる。
// 味方への行動委譲の効果はstep4で実装する。現状はbaseDamage0のno-op。
export const puppet: Action = buildAction(
  {
    key: "puppet",
    name: "操り人形",
    description: "近接マスの味方に通常行動をさせる",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 1,
  },
  effectBaseDamage,
  filterAlive,
);
