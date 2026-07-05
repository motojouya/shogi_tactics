import type { Side } from "../model/unit";
import type { Battle } from "../model/battle";
import type { Repository } from "../repository";

import { isFormation } from "../model/battle";

export const sideLabel = (side: Side): string => (side === "FIRST" ? "先手" : "後手");

// 短縮表記(先/後)。狭い表示(図など)向け。
export const sideMark = (side: Side): string => (side === "FIRST" ? "先" : "後");

export const pieceName = (pieceRepository: Repository["piece"], pieceKey: string): string => {
  const piece = pieceRepository.get(pieceKey);
  return piece ? piece.name : pieceKey;
};

export const statusName = (statusRepository: Repository["status"], statusKey: string): string => {
  const status = statusRepository.get(statusKey);
  return status ? status.name : statusKey;
};

export const resultLabel = (battle: Battle): string => {
  switch (battle.result) {
    case "FIRST":
      return `${battle.first_player_name} の勝利`;
    case "SECOND":
      return `${battle.second_player_name} の勝利`;
    case "DRAW":
      return "引き分け";
    default:
      return isFormation(battle) ? "編成中" : "対戦中";
  }
};
