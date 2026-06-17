import type { Turn } from "../model/turn";
import type { Unit, UnitReference } from "../model/unit";
import type { Action } from "../model/action";

import { copyTurn } from "../model/turn";
import { sameUnit, toUnitReference } from "../model/unit";

// 技を1人のreceiverに適用した結果を予測する(実行前の表示用)。死亡除外はせずhpの変化を見る。
export type Simulated = { survive: boolean; unit: Unit | null };

export type Simulate = (action: Action, actor: UnitReference, receiver: UnitReference, lastTurn: Turn) => Simulated;
export const simulate: Simulate = (action, actor, receiver, lastTurn) => {
  const working = copyTurn(lastTurn);
  const acted = action.act(actor, [receiver], working);
  const found = acted.units.find((unit) => sameUnit(toUnitReference(unit), receiver));

  return {
    survive: !!found && found.hp >= 1,
    unit: found ?? null,
  };
};
