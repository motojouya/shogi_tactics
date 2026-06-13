import type { Action } from "./action";

export type Piece = {
  key: string;
  name: string;
  description: string;
  MaxHP: number;
  move: number;
  actions: Action[];
};
