import type { BattleRepository } from "./battle";
import type { Local } from "./local";
import type { Resolvers } from "../model/resolver";

import { createBattleRepository } from "./battle";
import { pieceRepository } from "./piece";
import { actionRepository } from "./action";
import { statusRepository } from "./status";
import { local } from "./local";

// 全repositoryを1つのオブジェクトに束ねたcontext値。
// piece/action/statusは静的データのmemory repository、localはブラウザ環境provider、battleのみDexie初期化のため生成は非同期。
export type Repository = {
  battle: BattleRepository;
  piece: typeof pieceRepository;
  action: typeof actionRepository;
  status: typeof statusRepository;
  local: Local;
};

export const createRepository = async (): Promise<Repository> => {
  const battle = await createBattleRepository();
  return { battle, piece: pieceRepository, action: actionRepository, status: statusRepository, local };
};

// step15(S8/§7.1b): modelが要求するResolvers束を、repositoryのmemory get(メソッド)から取得して生成する。
// 静的関数を別途定義せず、各memory repositoryのgetメソッドをそのまま束ねる。
export type CreateResolvers = (repository: Repository) => Resolvers;
export const createResolvers: CreateResolvers = (repository) => ({
  getAction: repository.action.get,
  getPiece: repository.piece.get,
  getStatus: repository.status.get,
});
