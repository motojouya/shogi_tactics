import { z } from "zod";

import { copyUnit, unitSchema, unitReferenceSchema } from "./unit";

// 何もしないを表すOrderのキー(form/UIの選択肢として利用)
export const ORDER_DO_NOTHING = "DO_NOTHING";

// step12: Order/Turnもzod schemaから型導出する。

// 編成段階(unit決定中)。先頭Turnの初期状態にも用いる。
export const formationSchema = z.object({
  type: z.literal("FORMATION"),
});
export type Formation = z.infer<typeof formationSchema>;

// 技の実行。actionKey(過渡的にキー保持。実体解決はpresentation/step8)とactor/receiversはUnitReferenceで持つ。
export const doActionSchema = z.object({
  type: z.literal("DO_SKILL"),
  actionKey: z.string(),
  actor: unitReferenceSchema,
  receivers: z.array(unitReferenceSchema),
});
export type DoAction = z.infer<typeof doActionSchema>;

export const doNothingSchema = z.object({
  type: z.literal("DO_NOTHING"),
  actor: unitReferenceSchema,
});
export type DoNothing = z.infer<typeof doNothingSchema>;

export const surrenderSchema = z.object({
  type: z.literal("SURRENDER"),
  actor: unitReferenceSchema,
});
export type Surrender = z.infer<typeof surrenderSchema>;

export const orderSchema = z.discriminatedUnion("type", [
  formationSchema,
  doActionSchema,
  doNothingSchema,
  surrenderSchema,
]);
export type Order = z.infer<typeof orderSchema>;

// datetimeはmodel/json(store_schema)ともにDateで統一。z.coerce.date()でJSON import時の文字列もDate化する。
export const turnSchema = z.object({
  datetime: z.coerce.date(),
  order: orderSchema,
  units: z.array(unitSchema), // 行動適用・死亡除外後の全生存駒。steps昇順=次の行動順。初期値はlength=0
});
export type Turn = z.infer<typeof turnSchema>;

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
