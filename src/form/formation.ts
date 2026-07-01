import type { Piece } from "../model/piece";
import type { SelectOption } from "../repository/utility";

import { z } from "zod";

export const formationFormSchema = z.object({
  piece: z.string().min(1, "駒を選択してください"),
  leader: z.boolean(),
});
export type FormationForm = z.infer<typeof formationFormSchema>;

export type PieceSelectOption = (piece: Piece) => SelectOption;
export const pieceSelectOption: PieceSelectOption = (piece) => ({
  value: piece.key,
  label: piece.name,
});
