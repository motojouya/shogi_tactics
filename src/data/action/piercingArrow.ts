import type { Action } from "../../model/action";
import { buildAction, effectBaseDamage, filterAlive } from "../../model/action";

// 竜王の反動行動。貫通弓矢。直線5マスを貫通して攻撃1。
// 直線・貫通の座標判定はstep4方針によりno-op(説明テキスト扱い)。対象はユーザーが手動選択する。
export const piercingArrow: Action = buildAction(
  {
    key: "piercingArrow",
    name: "貫通弓矢",
    description: "直線5マスを貫通して攻撃1",
    baseDamage: 1,
    receiverCount: 5,
    cost: 7,
    effectLength: 5,
    reachLength: 5,
    // 効果は直線(reachRange)で表すため、着地点中心のeffectRangeは持たない。
    effectRange: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ],
    // 直線5マス貫通。Actorを中心から2マス下[5][3]へずらし、上方向へ5マスを影響範囲とする。
    reachRange: [
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
    ],
  },
  effectBaseDamage,
  filterAlive,
);
