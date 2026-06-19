import type { Piece } from "../model/piece";
import type { SelectOption } from "../repository/utility";

import { z } from "zod";

// step15: 編成画面の「駒を1体追加する」フォームのzod schema。pieceは駒種キー、leaderは大将指定。
// 値の検証(駒未選択の弾き)をschemaに集約し、画面側はこれをzodResolverで利用する。
export const formationFormSchema = z.object({
  piece: z.string().min(1, "駒を選択してください"),
  leader: z.boolean(),
});
export type FormationForm = z.infer<typeof formationFormSchema>;

// 駒を選択肢(value=駒種キー, label=駒名)へ変換する(form/action.tsのreceiverSelectOptionと同じ役割)。
export type PieceSelectOption = (piece: Piece) => SelectOption;
export const pieceSelectOption: PieceSelectOption = (piece) => ({
  value: piece.key,
  label: piece.name,
});
