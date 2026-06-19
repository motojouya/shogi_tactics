import type { Piece } from "./piece";

import { z } from "zod";

// step12: modelの型はzod schemaから導出する(型の単一の真実)。保存値はすべてキー参照(piece/status)なのでmodelとjsonの形はdatetime以外一致する。
export const sideSchema = z.enum(["FIRST", "SECOND"]);
export type Side = z.infer<typeof sideSchema>;

export const unitSchema = z.object({
  side: sideSchema,
  piece: z.string(), // 駒種キー
  hp: z.number(), // 体力
  steps: z.number(), // 順番ポイント(初期0)。小さいほど先に行動
  statuses: z.array(z.string()), // 状態異常キーの配列
  leader: z.boolean(), // 大将。先手/後手それぞれ1体。hp=0でその陣営は敗北
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

// `${side}:${piece}` 形式のフォーム値文字列からUnitReferenceを復元する
export type SelectUnit = (value: string) => UnitReference;
export const selectUnit: SelectUnit = (value) => {
  const index = value.indexOf(":");
  const side = value.slice(0, index) as Side;
  const piece = value.slice(index + 1);
  return { side, piece };
};

// --- 通常モードのunit構築(旧 normal_mode.ts) ---

// 駒の初期の順番: 飛->角->金->銀->桂->香->王。leaderはking固定。
export const NORMAL_PIECE_ORDER: string[] = ["rook", "bishop", "gold", "silver", "knight", "lance", "king"];

// 先頭ほどstepsが小さい扱い(steps=0同点はindexで決着)なので、ここで先手->後手を駒順に交互へ並べる。
const NORMAL_SIDES: Side[] = ["FIRST", "SECOND"];

export type GetPiece = (key: string) => Piece | null | undefined;

// 通常モードの先頭Turn units。駒順ごとに先手->後手で交互に並べ、第1ラウンドが両軍交互の行動になるようにする。
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
