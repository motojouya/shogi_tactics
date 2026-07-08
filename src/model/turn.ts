import type { Unit } from "./unit";

import { z } from "zod";

import { copyUnit, unitSchema, unitReferenceSchema } from "./unit";

export const ORDER_DO_NOTHING = "DO_NOTHING";

export const formationSchema = z.object({
  type: z.literal("FORMATION"),
});
export type Formation = z.infer<typeof formationSchema>;

export const doActionSchema = z.object({
  type: z.literal("DO_ACTION"),
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

export const turnSchema = z.object({
  datetime: z.coerce.date(),
  previous: z.number().default(0), // 巻き戻し用。このTurnの直前Turnのindex(先頭=0)。default(0)で旧データ互換
  order: orderSchema,
  units: z.array(unitSchema),
});
export type Turn = z.infer<typeof turnSchema>;

export type CopyOrder = (order: Order) => Order;
export const copyOrder: CopyOrder = (order) => {
  if (order.type === "DO_ACTION") {
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
  previous: turn.previous,
  order: copyOrder(turn.order),
  units: turn.units.map(copyUnit),
});

export type Start = (units: Unit[], datetime: Date) => Turn;
export const start: Start = (units, datetime) => ({
  datetime,
  previous: 0,
  order: { type: "FORMATION" },
  units: units.map(copyUnit),
});

export type GetFormationUnits = (turns: Turn[]) => Unit[];
export const getFormationUnits: GetFormationUnits = (turns) => {
  const formationTurn = turns.find((turn) => turn.order.type === "FORMATION");
  return formationTurn ? formationTurn.units : [];
};

export type SortedUnits = (turn: Turn) => Unit[];
export const sortedUnits: SortedUnits = (turn) =>
  turn.units
    .filter((unit) => unit.hp >= 1)
    .slice()
    .sort((left, right) => left.steps - right.steps);

export type NextActor = (turn: Turn) => Unit | null;
export const nextActor: NextActor = (turn) => {
  const alive = sortedUnits(turn);
  return alive.length > 0 ? alive[0] : null;
};
