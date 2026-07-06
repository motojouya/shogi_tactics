import type { Unit, UnitReference } from "./unit";
import type { GetPiece } from "./piece";

import { sameUnit, toUnitReference } from "./unit";

export type Act = (actor: UnitReference, receiver: UnitReference[], units: Unit[], getPiece: GetPiece) => Unit[];
export type Filter = (actor: UnitReference, units: Unit[]) => UnitReference[];

export type Action = {
  key: string;
  name: string;
  description: string;
  act: Act;
  filter: Filter;
  baseDamage: number;
  receiverCount: number;
  cost: number;
  effectLength: number;
  reachLength: number;
  // 画面上で影響範囲を可視化するための将棋マス表現。値は10進だが2進で意味を持つ(bit0=影響あり, bit1=Actorのマス)。
  // 0=影響なし, 1=影響あり, 2=Actorのマス(影響なし), 3=Actorのマス かつ 影響あり。
  effectRange: number[][]; // 対象/着地点を中心[1][1]とした3×3
  reachRange: number[][]; // Actorを中心[3][3]とした7×7(piercingArrowのみActorを2マス下[5][3]へずらす)
};

export type GetAction = (key: string) => Action | null;

export class ReceiverDuplicationError {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export type ValidateReceivers = (receivers: UnitReference[]) => ReceiverDuplicationError | null;
export const validateReceivers: ValidateReceivers = (receivers) => {
  const keys = receivers.map((receiver) => `${receiver.side}:${receiver.piece}`);
  if (new Set(keys).size !== keys.length) {
    return new ReceiverDuplicationError("同じunitを複数回えらべません");
  }
  return null;
};

const RANGED_REACH_THRESHOLD = 2;

export type EffectBaseDamage = (self: Action) => Act;
export const effectBaseDamage: EffectBaseDamage = (self) => (_actor, receiver, units) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      let damage = self.baseDamage;
      if (self.reachLength > RANGED_REACH_THRESHOLD && unit.statuses.includes("arrowDodge")) {
        damage = 0;
      }
      if (unit.statuses.includes("interception")) {
        damage = Math.max(damage - 1, 0);
      }
      return { ...unit, hp: Math.max(unit.hp - damage, 0) };
    }
    return unit;
  });

export type EffectGrantStatus = (statusKey: string) => (self: Action) => Act;
export const effectGrantStatus: EffectGrantStatus = (statusKey) => (_self) => (_actor, receiver, units) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      if (unit.statuses.includes(statusKey)) {
        return unit;
      }
      return { ...unit, statuses: [...unit.statuses, statusKey] };
    }
    return unit;
  });

export type EffectHeal = (self: Action) => Act;
export const effectHeal: EffectHeal = (_self) => (_actor, receiver, units, getPiece) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      const maxHp = getPiece(unit.piece)?.MaxHP ?? unit.hp;
      return { ...unit, hp: Math.max(unit.hp, maxHp) };
    }
    return unit;
  });

export type EffectOverHeal = (self: Action) => Act;
export const effectOverHeal: EffectOverHeal = (_self) => (_actor, receiver, units) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      return { ...unit, hp: unit.hp + 1 };
    }
    return unit;
  });

export type FilterActor = (self: Action) => Filter;
export const filterActor: FilterActor = (_self) => (actor, _units) => [actor];

export type FilterAlive = (self: Action) => Filter;
export const filterAlive: FilterAlive = (_self) => (_actor, units) =>
  units.filter((unit) => unit.hp >= 1).map(toUnitReference);

export type BuildAction = (
  base: Omit<Action, "act" | "filter">,
  actFactory: (self: Action) => Act,
  filterFactory: (self: Action) => Filter,
) => Action;
export const buildAction: BuildAction = (base, actFactory, filterFactory) => {
  const action = base as Action;
  action.act = actFactory(action);
  action.filter = filterFactory(action);
  return action;
};
