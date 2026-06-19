import type { Action } from "./action";

export type Piece = {
  key: string;
  name: string;
  description: string;
  MaxHP: number;
  move: number;
  actions: Action[];
};

// step15(S4): repositoryのpiece memory getをmodelへ渡すためのresolver型。
export type GetPiece = (key: string) => Piece | null;
