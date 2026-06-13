import type { SelectOption } from "../io/dialogue";
import type { Piece } from "./piece";

export type Side = "FIRST" | "SECOND";

export type Unit = {
  side: Side;
  piece: string; // 駒種キー
  hp: number; // 体力
  steps: number; // 順番ポイント(初期0)。小さいほど先に行動
  statuses: string[]; // 状態異常キーの配列
};

export type UnitReference = {
  side: Side;
  piece: string;
};

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

type SideLabel = (side: Side) => string;
const sideLabel: SideLabel = (side) => (side === "FIRST" ? "先" : "後");

// charactor.getSelectOption相当。unitのside表示＋pieceの名前をlabelに、side＋pieceのkeyをvalueに入れる
export type GetSelectOption = (unit: Unit, piece: Piece) => SelectOption;
export const getSelectOption: GetSelectOption = (unit, piece) => ({
  label: `${sideLabel(unit.side)}:${piece.name}`,
  value: `${unit.side}:${piece.key}`,
});

// charactor.selectCharactor相当。getSelectOptionのvalue文字列からUnitReferenceを復元する
export type SelectUnit = (value: string) => UnitReference;
export const selectUnit: SelectUnit = (value) => {
  const index = value.indexOf(":");
  const side = value.slice(0, index) as Side;
  const piece = value.slice(index + 1);
  return { side, piece };
};
