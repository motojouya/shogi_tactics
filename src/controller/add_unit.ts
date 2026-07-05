import type { Battle } from "../model/battle";
import type { Side } from "../model/unit";
import type { Repository } from "../repository";

import { getFormationUnits, addFormationUnit } from "../model/battle";
import { canAddPiece, sideHasLeader } from "../model/unit";

// 編成中のrosterに駒を1体追加して保存する。追加不可(重複/駒なし)なら元のbattleを返す。
export type AddUnit = (
  repository: Repository,
) => (battle: Battle, side: Side, pieceKey: string, leader: boolean) => Promise<Battle>;
export const addUnit: AddUnit = (repository) => async (battle, side, pieceKey, leader) => {
  const { battle: battleRepository, piece: pieceRepository } = repository;
  const units = getFormationUnits(battle);

  if (!canAddPiece(units, side, pieceKey)) {
    return battle;
  }
  const piece = pieceRepository.get(pieceKey);
  if (!piece) {
    return battle;
  }

  // leaderは各陣営1体まで。既にleaderが居ればleader指定は無効化する。
  const asLeader = leader && !sideHasLeader(units, side);
  const newBattle = addFormationUnit(battle, {
    side,
    piece: piece.key,
    hp: piece.MaxHP,
    steps: 0,
    statuses: [],
    leader: asLeader,
  });

  await battleRepository.save(newBattle);
  return newBattle;
};
