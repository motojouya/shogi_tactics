import type { Unit, UnitReference } from "./unit";
import type { GetPiece } from "./piece";

import { sameUnit, toUnitReference } from "./unit";

// 技の効果を定義する関数。actor/receiverと行動前unitsを受け取り行動後unitsを返す(Turn非依存。§7.4c)。
// getPieceはPiece解決resolver(MaxHP等の参照に使う。§2.4)。
export type Act = (actor: UnitReference, receiver: UnitReference[], units: Unit[], getPiece: GetPiece) => Unit[];

// 技を適用するunitの選択肢をunitsから絞り込んで返す関数(Turn非依存)。
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

// step15(S4): repositoryのaction memory getをmodelへ渡すためのresolver型。
export type GetAction = (key: string) => Action | null;

// step15(S5/§7.1c): 受け手重複はドメイン制約。同じunitを複数回対象にできない。
// (form/battle.tsにも同名の暫定classがあるが、S13でこのmodel版へ寄せる)
export class ReceiverDuplicationError {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

// 受け手リストに重複(同一 side:piece)があればエラー、無ければnull。
export type ValidateReceivers = (receivers: UnitReference[]) => ReceiverDuplicationError | null;
export const validateReceivers: ValidateReceivers = (receivers) => {
  const keys = receivers.map((receiver) => `${receiver.side}:${receiver.piece}`);
  if (new Set(keys).size !== keys.length) {
    return new ReceiverDuplicationError("同じunitを複数回えらべません");
  }
  return null;
};

// reachLengthがこの値より大きいActionを遠隔攻撃とみなす(矢かわしの無効化判定に使用)。
const RANGED_REACH_THRESHOLD = 2;

// baseDamageを対象者(receiver)に与え、cloneしたTurnのunitsを更新して返すActを生成する。
// receiverのstatusesによる被ダメージ軽減を考慮する:
// - interception(迎撃体制): 受けるダメージが1減る。
// - arrowDodge(矢かわし): 遠隔攻撃(reachLength > 2)のダメージが0になる。
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

// receiverのstatusesにstatus keyを付与(重複は追加しない)し、cloneしたTurnを返すActを生成する。
// 付与するstatus keyはファクトリ引数で渡す。例: effectGrantStatus("interception")
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

// receiverの体力を上限(piece.MaxHP)まで回復し、cloneしたTurnを返すActを生成する(回復処方=最大回復)。
// MaxHPはgetPiece resolver経由でPieceから取得する(§2.4: 旧healCapハードコードを解消。promotedLance等MaxHP=2の駒も正しく扱える)。
// 既に上限を超えている場合(身代わり等)は減らさない。解決できないpieceは現hpを上限扱いにして増減しない。
export type EffectHeal = (self: Action) => Act;
export const effectHeal: EffectHeal = (_self) => (_actor, receiver, units, getPiece) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      const maxHp = getPiece(unit.piece)?.MaxHP ?? unit.hp;
      return { ...unit, hp: Math.max(unit.hp, maxHp) };
    }
    return unit;
  });

// receiverの体力を1回復し、cloneしたTurnを返すActを生成する(身代わり=上限を超えて追加可能)。
export type EffectOverHeal = (self: Action) => Act;
export const effectOverHeal: EffectOverHeal = (_self) => (_actor, receiver, units) =>
  units.map((unit) => {
    if (receiver.some((reference) => sameUnit(reference, toUnitReference(unit)))) {
      return { ...unit, hp: unit.hp + 1 };
    }
    return unit;
  });

// actor自身のunit_referenceのみを選択肢として返すFilterを生成する
export type FilterActor = (self: Action) => Filter;
export const filterActor: FilterActor = (_self) => (actor, _units) => [actor];

// hpが1以上のunitのunit_referenceリストを選択肢として返すFilterを生成する
export type FilterAlive = (self: Action) => Filter;
export const filterAlive: FilterAlive = (_self) => (_actor, units) =>
  units.filter((unit) => unit.hp >= 1).map(toUnitReference);

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
