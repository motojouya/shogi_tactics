import type { Unit, Side } from "../model/unit";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

const sideValues: [Side, Side] = ["FIRST", "SECOND"];

export const unitSchema = z.object({
  side: z.enum(sideValues),
  piece: z.string(), // 駒種キー(参照解決はpresentation/controller。step6では過渡的にキーのみ保持)
  hp: z.number(),
  steps: z.number(),
  statuses: z.array(z.string()),
});
export type UnitSchema = typeof unitSchema;
export type UnitJson = z.infer<UnitSchema>;

export const toUnitJson: ToJson<Unit, UnitJson> = (unit) => ({
  side: unit.side,
  piece: unit.piece,
  hp: unit.hp,
  steps: unit.steps,
  statuses: [...unit.statuses],
});

// UnitとUnitJsonは同形。piece実体の検証はstep8(key参照寄せ)で扱うため、ここでは素直に写す。
export const toUnit: ToModel<Unit, UnitJson, never> = (unitJson) => ({
  side: unitJson.side,
  piece: unitJson.piece,
  hp: unitJson.hp,
  steps: unitJson.steps,
  statuses: [...unitJson.statuses],
});
