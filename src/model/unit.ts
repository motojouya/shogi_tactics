import type { GetPiece } from "./piece";

import { z } from "zod";

// step12: modelの型はzod schemaから導出する(型の単一の真実)。保存値はすべてキー参照(piece/status)なのでmodelとjsonの形はdatetime以外一致する。
export const sideSchema = z.enum(["FIRST", "SECOND"]);
export type Side = z.infer<typeof sideSchema>;
export const FIRST: Side = "FIRST";
export const SECOND: Side = "SECOND";

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

// step15(S13/§7.1e): `${side}:${piece}` 形式フォーム値の解釈(selectUnit)はform層の責務なのでform/action.tsへ移設した。

// --- 通常モードのunit構築(旧 normal_mode.ts) ---

// 駒の初期の順番: 飛->角->金->銀->桂->香->王。leaderはking固定。
export const NORMAL_PIECE_ORDER: string[] = ["rook", "bishop", "gold", "silver", "knight", "lance", "king"];

// 先頭ほどstepsが小さい扱い(steps=0同点はindexで決着)なので、ここで先手->後手を駒順に交互へ並べる。
const NORMAL_SIDES: Side[] = ["FIRST", "SECOND"];

// 通常モードの先頭Turn units。駒順ごとに先手->後手で交互に並べ、第1ラウンドが両軍交互の行動になるようにする。
// getPieceは piece.ts のGetPiece resolver(=> Piece | null)を利用する。
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

// --- 編成(formation)の検証(step15 S5/§2.3。formation UIのルールをmodelに集約) ---

// 次に駒を追加する陣営。先手が先、数が揃っていれば先手、先手が1多ければ後手。双方unitCount到達でnull(=完了)。
export type NextFormationSide = (units: Unit[], unitCount: number) => Side | null;
export const nextFormationSide: NextFormationSide = (units, unitCount) => {
  const firstCount = units.filter((unit) => unit.side === "FIRST").length;
  const secondCount = units.filter((unit) => unit.side === "SECOND").length;
  if (firstCount === secondCount) {
    return firstCount < unitCount ? "FIRST" : null;
  }
  return secondCount < unitCount ? "SECOND" : null;
};

// その陣営が既にleaderを持っているか(各陣営leaderは1体まで)。
export type SideHasLeader = (units: Unit[], side: Side) => boolean;
export const sideHasLeader: SideHasLeader = (units, side) => units.some((unit) => unit.side === side && unit.leader);

// 同じ陣営に同じ駒を二重に置けない(駒重複検証。§2.3で欠落していたルール)。追加可ならtrue。
export type CanAddPiece = (units: Unit[], side: Side, piece: string) => boolean;
export const canAddPiece: CanAddPiece = (units, side, piece) =>
  !units.some((unit) => unit.side === side && unit.piece === piece);

// 双方unitCountに達し、各陣営ちょうど1体leaderが居れば編成完了(Start可能)。
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
