import type { GetAction } from "./action";
import type { GetPiece } from "./piece";
import type { GetStatus } from "./status";

// step15(S4/§7.1b): repositoryのmemory get(action/piece/status)をmodelへ渡すためのresolver束。
// 形(型)はModel側に定義し、repository/index(S8)がこの形のdictionaryを生成してbattle model(S6/S7)へ渡す。
export type Resolvers = {
  getAction: GetAction;
  getPiece: GetPiece;
  getStatus: GetStatus;
};
