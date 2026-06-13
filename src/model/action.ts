import type { Turn } from "./turn";
import type { UnitReference } from "./unit";

// 技の効果を定義する関数
export type Act = (self: Action, actor: UnitReference, receiver: UnitReference[], turn: Turn) => Turn;

// 技を適用するunitの選択肢をFilterする関数
export type Filter = (self: Action, actor: UnitReference, turn: Turn) => UnitReference[];

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
