import type { Turn, Order } from "../model/turn";
import type { Unit } from "../model/unit";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { toUnit, toUnitJson, unitSchema, toUnitReference, toUnitReferenceJson, unitReferenceSchema } from "./unit";

export const formationSchema = z.object({
  type: z.literal("FORMATION"),
});

export const doActionSchema = z.object({
  type: z.literal("DO_SKILL"),
  actionKey: z.string(),
  actor: unitReferenceSchema,
  receivers: z.array(unitReferenceSchema),
});

export const doNothingSchema = z.object({
  type: z.literal("DO_NOTHING"),
  actor: unitReferenceSchema,
});

export const surrenderSchema = z.object({
  type: z.literal("SURRENDER"),
  actor: unitReferenceSchema,
});

export const orderSchema = z.discriminatedUnion("type", [
  formationSchema,
  doActionSchema,
  doNothingSchema,
  surrenderSchema,
]);
export type OrderSchema = typeof orderSchema;
export type OrderJson = z.infer<OrderSchema>;

export const turnSchema = z.object({
  // datetimeはmodelとjsonでDateに統一。IndexedDB(Dexie)は構造化クローンでDateをネイティブ保存し、JSON import時の文字列はcoerceでDate化する。
  datetime: z.coerce.date(),
  order: orderSchema,
  units: z.array(unitSchema),
});
export type TurnSchema = typeof turnSchema;
export type TurnJson = z.infer<TurnSchema>;

export const toOrderJson: ToJson<Order, OrderJson> = (order) => {
  if (order.type === "DO_SKILL") {
    return {
      type: "DO_SKILL",
      actionKey: order.actionKey,
      actor: toUnitReferenceJson(order.actor),
      receivers: order.receivers.map(toUnitReferenceJson),
    };
  }
  if (order.type === "DO_NOTHING") {
    return {
      type: "DO_NOTHING",
      actor: toUnitReferenceJson(order.actor),
    };
  }
  if (order.type === "SURRENDER") {
    return {
      type: "SURRENDER",
      actor: toUnitReferenceJson(order.actor),
    };
  }
  return {
    type: "FORMATION",
  };
};

export const toTurnJson: ToJson<Turn, TurnJson> = (turn) => ({
  datetime: turn.datetime,
  order: toOrderJson(turn.order),
  units: turn.units.map(toUnitJson),
});

// step7: actionKey/actor/receiversは過渡的にキー/参照のみ保持。Action実体の解決はpresentation(step8)。
export const toOrder: ToModel<Order, OrderJson, never> = (orderJson) => {
  if (orderJson.type === "DO_SKILL") {
    return {
      type: "DO_SKILL",
      actionKey: orderJson.actionKey,
      actor: toUnitReference(orderJson.actor),
      receivers: orderJson.receivers.map(toUnitReference),
    };
  }
  if (orderJson.type === "DO_NOTHING") {
    return {
      type: "DO_NOTHING",
      actor: toUnitReference(orderJson.actor),
    };
  }
  if (orderJson.type === "SURRENDER") {
    return {
      type: "SURRENDER",
      actor: toUnitReference(orderJson.actor),
    };
  }
  return {
    type: "FORMATION",
  };
};

// datetimeはschema(z.coerce.date())でDateに正規化済みのため、ここは構造を写すだけ(parse不要・エラーなし)。
export const toTurn: ToModel<Turn, TurnJson, never> = (turnJson) => {
  const order = toOrder(turnJson.order);
  const units: Unit[] = turnJson.units.map(toUnit);

  return {
    datetime: turnJson.datetime,
    order,
    units,
  };
};
