import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 成香の反動行動。操り人形。近接マスの味方に通常行動をさせる。
// puppetを使うunit→操られるunit→そのunitの攻撃で1ダメージを受けるunit、という3者構造。
// 選択する対象はダメージを与える対象(操られたunitの攻撃を受けるunit)。
// NOTE: 操られたunitの通常行動に関わらず、与えるダメージは常に1固定の仕様。
export const puppet: Action = buildAction(
  {
    key: "puppet",
    name: "操り人形",
    description: "近接マスの味方に通常行動をさせる。ダメージを与える対象を選択する",
    baseDamage: 1,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 1,
  },
  effectBaseDamage,
  filterAlive,
);
