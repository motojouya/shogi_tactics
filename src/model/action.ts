import type { Turn } from "./turn";
import type { UnitReference } from "./unit";

import { copyTurn } from "./turn";
import { sameUnit, toUnitReference } from "./unit";

// 技の効果を定義する関数
export type Act = (actor: UnitReference, receiver: UnitReference[], turn: Turn) => Turn;

// 技を適用するunitの選択肢をFilterする関数
export type Filter = (actor: UnitReference, turn: Turn) => UnitReference[];

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
};

// baseDamageを対象者(receiver)に与え、cloneしたTurnのunitsを更新して返すActを生成する
export type EffectBaseDamage = (self: Action) => Act;
export const effectBaseDamage: EffectBaseDamage = (self) => (_actor, receiver, turn) => {
  const newTurn = copyTurn(turn);
  newTurn.units = newTurn.units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      return { ...unit, hp: Math.max(unit.hp - self.baseDamage, 0) };
    }
    return unit;
  });
  return newTurn;
};

// actor自身のunit_referenceのみを選択肢として返すFilterを生成する
export type FilterActor = (self: Action) => Filter;
export const filterActor: FilterActor = (_self) => (actor, _turn) => [actor];

// hpが1以上のunitのunit_referenceリストを選択肢として返すFilterを生成する
export type FilterAlive = (self: Action) => Filter;
export const filterAlive: FilterAlive = (_self) => (_actor, turn) =>
  turn.units.filter((unit) => unit.hp >= 1).map(toUnitReference);

// act/filterはself(Action)を必要とするため、構築時の自己参照を吸収するヘルパ。
// baseDamage等のメタを持つActionを先に組み立て、actFactory/filterFactoryでact/filterを後付けする。
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
