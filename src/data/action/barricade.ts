import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterActor } from "../../model/action";

// 成桂の反動行動。防柵設置。近接マスにバリケードを配置する(敵は1ダメージで破壊可能)。
// バリケード配置の座標判定はstep4方針によりno-op(説明テキスト扱い)。現状はbaseDamage0のno-op。
export const barricade: Action = buildAction(
  {
    key: "barricade",
    name: "防柵設置",
    description: "近接マスにバリケードを配置する。敵は1ダメージで破壊できる",
    baseDamage: 0,
    receiverCount: 1,
    cost: 7,
    effectLength: 1,
    reachLength: 1,
    effectRange: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0],
    ],
    reachRange: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 2, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterActor,
);
