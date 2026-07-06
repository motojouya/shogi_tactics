import type { Action } from "./action";

export type Piece = {
  key: string;
  name: string;
  shogiName: string;
  description: string;
  MaxHP: number;
  move: number;
  actions: Action[];
};

export type GetPiece = (key: string) => Piece | null;
