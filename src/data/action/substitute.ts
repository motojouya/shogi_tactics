import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterActor } from "../../model/action";

// と金の反動行動。身代わり。自分の体力を1回復する(体力の限界を超えて追加できる)。
// 回復・限界超過の効果はstep4で実装する。現状はbaseDamage0のno-op。
export const substitute: Action = buildAction(
  {
    key: "substitute",
    name: "身代わり",
    description: "自分の体力を1回復する。体力の限界を超えて追加できる",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 0,
  },
  effectBaseDamage,
  filterActor,
);
