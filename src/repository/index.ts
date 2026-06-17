import type { BattleRepository } from "./battle";
import type { Local } from "./local";

import { createRepository as createBattleRepository } from "./battle";
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
