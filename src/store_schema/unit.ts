import type { Unit, UnitReference, Side } from "../model/unit";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

const sideValues: [Side, Side] = ["FIRST", "SECOND"];

export const unitReferenceSchema = z.object({
  side: z.enum(sideValues),
  piece: z.string(),
});
export type UnitReferenceSchema = typeof unitReferenceSchema;
export type UnitReferenceJson = z.infer<UnitReferenceSchema>;

export const toUnitReferenceJson: ToJson<UnitReference, UnitReferenceJson> = (reference) => ({
  side: reference.side,
  piece: reference.piece,
});

export const toUnitReference: ToModel<UnitReference, UnitReferenceJson, never> = (referenceJson) => ({
  side: referenceJson.side,
  piece: referenceJson.piece,
});

export const unitSchema = z.object({
  side: z.enum(sideValues),
  piece: z.string(), // 駒種キー(参照解決はpresentation/controller。step6では過渡的にキーのみ保持)
  hp: z.number(),
  steps: z.number(),
  statuses: z.array(z.string()),
  leader: z.boolean(),
});
export type UnitSchema = typeof unitSchema;
export type UnitJson = z.infer<UnitSchema>;

export const toUnitJson: ToJson<Unit, UnitJson> = (unit) => ({
  side: unit.side,
  piece: unit.piece,
  hp: unit.hp,
  steps: unit.steps,
  statuses: [...unit.statuses],
  leader: unit.leader,
});

// UnitとUnitJsonは同形。piece実体の検証はstep8(key参照寄せ)で扱うため、ここでは素直に写す。
export const toUnit: ToModel<Unit, UnitJson, never> = (unitJson) => ({
  side: unitJson.side,
  piece: unitJson.piece,
  hp: unitJson.hp,
  steps: unitJson.steps,
  statuses: [...unitJson.statuses],
  leader: unitJson.leader,
});
