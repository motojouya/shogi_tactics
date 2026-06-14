import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 成香の反動行動。操り人形。近接マスの味方に通常行動をさせる。
// 味方への行動委譲はターン進行を伴うmeta的な効果のため、act内では実装せずno-op(説明テキスト扱い)とする。
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
