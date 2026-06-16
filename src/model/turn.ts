import type { Unit, UnitReference } from "./unit";

import { copyUnit } from "./unit";

// 何もしないを表すOrderのキー(form/UIの選択肢として利用)
export const ORDER_DO_NOTHING = "DO_NOTHING";

// 編成段階(unit決定中)。先頭Turnの初期状態にも用いる。
export type Formation = {
  type: "FORMATION";
};

// 技の実行。actionKey(過渡的にキー保持。実体解決はpresentation/step8)とactor/receiversはUnitReferenceで持つ。
export type DoAction = {
  type: "DO_SKILL";
  actionKey: string;
  actor: UnitReference;
  receivers: UnitReference[];
};

export type DoNothing = {
  type: "DO_NOTHING";
  actor: UnitReference;
};

export type Surrender = {
  type: "SURRENDER";
  actor: UnitReference;
};

export type Order = Formation | DoAction | DoNothing | Surrender;

export type Turn = {
  datetime: Date;
  order: Order;
  units: Unit[]; // 行動適用・死亡除外後の全生存駒。steps昇順=次の行動順。初期値はlength=0
};

export type CopyOrder = (order: Order) => Order;
export const copyOrder: CopyOrder = (order) => {
  if (order.type === "DO_SKILL") {
    return {
      type: order.type,
      actionKey: order.actionKey,
      actor: { ...order.actor },
      receivers: order.receivers.map((receiver) => ({ ...receiver })),
    };
  }
  if (order.type === "DO_NOTHING") {
    return {
      type: order.type,
      actor: { ...order.actor },
    };
  }
  if (order.type === "SURRENDER") {
    return {
      type: order.type,
      actor: { ...order.actor },
    };
  }
  return {
    type: order.type,
  };
};

export type CopyTurn = (turn: Turn) => Turn;
export const copyTurn: CopyTurn = (turn) => ({
  datetime: new Date(turn.datetime.getTime()),
  order: copyOrder(turn.order),
  units: turn.units.map(copyUnit),
});
