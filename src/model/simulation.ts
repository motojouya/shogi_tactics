import type { Turn } from "./turn";
import type { Unit, UnitReference } from "./unit";
import type { Action } from "./action";
import type { GetPiece } from "./piece";

import { copyUnit, sameUnit, toUnitReference } from "./unit";

// 技を1人のreceiverに適用した結果を予測する(実行前の表示用)。死亡除外はせずhpの変化を見る。
// step15(S6/§2.2): controllerからmodelへ移設。actのPiece解決のためgetPieceを受け取る。
export type Simulated = { survive: boolean; unit: Unit | null };

export type Simulate = (
  action: Action,
  actor: UnitReference,
  receiver: UnitReference,
  lastTurn: Turn,
  getPiece: GetPiece,
) => Simulated;
export const simulate: Simulate = (action, actor, receiver, lastTurn, getPiece) => {
  const acted = action.act(actor, [receiver], lastTurn.units.map(copyUnit), getPiece);
  const found = acted.find((unit) => sameUnit(toUnitReference(unit), receiver));

  return {
    survive: !!found && found.hp >= 1,
    unit: found ?? null,
  };
};
