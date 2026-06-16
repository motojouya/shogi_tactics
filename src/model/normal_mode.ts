import type { Unit, Side } from "./unit";
import type { Piece } from "./piece";

// note.md「通常モード」準拠。片側7駒固定、stepBaseは14(=unitCount*2)。
export const NORMAL_UNIT_COUNT = 7;
export const NORMAL_STEP_BASE = 14;

// 駒の初期の順番: 飛->角->金->銀->桂->香->王。leaderはking固定。
export const NORMAL_PIECE_ORDER: string[] = ["rook", "bishop", "gold", "silver", "knight", "lance", "king"];

// 先頭ほどstepsが小さい扱い(steps=0同点はindexで決着)なので、ここで先手->後手を駒順に交互へ並べる。
const NORMAL_SIDES: Side[] = ["FIRST", "SECOND"];

export type GetPiece = (key: string) => Piece | null | undefined;

// 通常モードの先頭Turn units。駒順ごとに先手->後手で交互に並べ、第1ラウンドが両軍交互の行動になるようにする。
export type BuildNormalUnits = (getPiece: GetPiece) => Unit[];
export const buildNormalUnits: BuildNormalUnits = (getPiece) =>
  NORMAL_PIECE_ORDER.flatMap((key) => {
    const piece = getPiece(key);
    if (!piece) {
      return [];
    }
    return NORMAL_SIDES.map((side) => ({
      side,
      piece: piece.key,
      hp: piece.MaxHP,
      steps: 0,
      statuses: [],
      leader: piece.key === "king",
    }));
  });
