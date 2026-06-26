import type { Action } from "./action";

export type Piece = {
  key: string;
  name: string;
  // 元になった将棋の駒名(王将/飛車など)。ゲーム上の名称(name)とは別に表示用で保持する。
  shogiName: string;
  description: string;
  MaxHP: number;
  move: number;
  actions: Action[];
};

// step15(S4): repositoryのpiece memory getをmodelへ渡すためのresolver型。
export type GetPiece = (key: string) => Piece | null;
