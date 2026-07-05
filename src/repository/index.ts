import type { BattleRepository } from "./battle";
import type { Local } from "./local";
import type { Resolvers } from "../model/resolver";

import { createBattleRepository } from "./battle";
import { pieceRepository } from "./piece";
import { actionRepository } from "./action";
import { statusRepository } from "./status";
import { local } from "./local";

/**
 * Repository
 *
 * Repositoryの中身は静的に、あるいはグローバル変数で解決できるものだが、それらをラップするために用意している。
 * BattleRepositoryのみ、IndexedDBを利用するので、非同期で解決される。
 * BattleRepository以外は静的に解決できるので存在しても害はなく、BattleRepositoryはほとんどの場面で利用するので、利便性のためにまとめておく
 */
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

export type CreateResolvers = (repository: Repository) => Resolvers;
export const createResolvers: CreateResolvers = (repository) => ({
  getAction: repository.action.get,
  getPiece: repository.piece.get,
  getStatus: repository.status.get,
});
