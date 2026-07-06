import type { GetAction } from "./action";
import type { GetPiece } from "./piece";
import type { GetStatus } from "./status";

export type Resolvers = {
  getAction: GetAction;
  getPiece: GetPiece;
  getStatus: GetStatus;
};
