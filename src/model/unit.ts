import type { GetPiece } from "./piece";

import { z } from "zod";

export const sideSchema = z.enum(["FIRST", "SECOND"]);
export type Side = z.infer<typeof sideSchema>;
export const FIRST: Side = "FIRST";
export const SECOND: Side = "SECOND";

export const unitSchema = z.object({
  side: sideSchema,
  piece: z.string(),
  hp: z.number(),
  steps: z.number(),
  statuses: z.array(z.string()),
  leader: z.boolean(),
});
export type Unit = z.infer<typeof unitSchema>;

export const unitReferenceSchema = z.object({
  side: sideSchema,
  piece: z.string(),
});
export type UnitReference = z.infer<typeof unitReferenceSchema>;

export type CopyUnit = (unit: Unit) => Unit;
export const copyUnit: CopyUnit = (unit) => ({
  ...unit,
  statuses: [...unit.statuses],
});

export type ToUnitReference = (unit: Unit) => UnitReference;
export const toUnitReference: ToUnitReference = (unit) => ({
  side: unit.side,
  piece: unit.piece,
});

export type SameUnit = (left: UnitReference, right: UnitReference) => boolean;
export const sameUnit: SameUnit = (left, right) => left.side === right.side && left.piece === right.piece;

export const NORMAL_PIECE_ORDER: string[] = ["rook", "bishop", "gold", "silver", "knight", "lance", "king"];

const NORMAL_SIDES: Side[] = ["FIRST", "SECOND"];

export type BuildNormalUnits = (getPiece: GetPiece) => Unit[];
export const buildNormalUnits: BuildNormalUnits = (getPiece) =>
  NORMAL_PIECE_ORDER.flatMap((key) => {
    const piece = getPiece(key);
    if (!piece) {
      return [];
    }
    return NORMAL_SIDES.map((side) => ({
      side,
      piece: piece.key,
      hp: piece.MaxHP,
      steps: 0,
      statuses: [],
      leader: piece.key === "king",
    }));
  });

export type NextFormationSide = (units: Unit[], unitCount: number) => Side | null;
export const nextFormationSide: NextFormationSide = (units, unitCount) => {
  const firstCount = units.filter((unit) => unit.side === "FIRST").length;
  const secondCount = units.filter((unit) => unit.side === "SECOND").length;
  if (firstCount === secondCount) {
    return firstCount < unitCount ? "FIRST" : null;
  }
  return secondCount < unitCount ? "SECOND" : null;
};

export type SideHasLeader = (units: Unit[], side: Side) => boolean;
export const sideHasLeader: SideHasLeader = (units, side) => units.some((unit) => unit.side === side && unit.leader);

export type CanAddPiece = (units: Unit[], side: Side, piece: string) => boolean;
export const canAddPiece: CanAddPiece = (units, side, piece) =>
  !units.some((unit) => unit.side === side && unit.piece === piece);

export type IsFormationComplete = (units: Unit[], unitCount: number) => boolean;
export const isFormationComplete: IsFormationComplete = (units, unitCount) => {
  const first = units.filter((unit) => unit.side === "FIRST");
  const second = units.filter((unit) => unit.side === "SECOND");
  return (
    first.length === unitCount &&
    second.length === unitCount &&
    first.filter((unit) => unit.leader).length === 1 &&
    second.filter((unit) => unit.leader).length === 1
  );
};
