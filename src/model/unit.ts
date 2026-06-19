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
