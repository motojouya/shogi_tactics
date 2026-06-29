import type { Side } from "../model/unit";

// piece key -> shogi-images(futamoji)のファイル名。多くはkeyと同名だが、成り駒のみ別名。
// 画像はCC0(sunfish-shogi/shogi-images)を public/piece/futamoji に同梱している。
const imageNameByKey: Record<string, string> = {
  king: "king",
  gold: "gold",
  silver: "silver",
  rook: "rook",
  bishop: "bishop",
  knight: "knight",
  lance: "lance",
  dragon: "dragon",
  horse: "horse",
  promotedSilver: "prom_silver",
  promotedKnight: "prom_knight",
  promotedLance: "prom_lance",
  pawn: "pawn",
  promotedPawn: "prom_pawn",
};

// 先手=black/後手=white。white画像は180度回転済みなので後手向きはそのまま自然に表示される。
// sideを指定しない箇所(guide/piece等)は先手の駒を表示する。
const colorBySide = (side: Side | undefined): "black" | "white" => (side === "SECOND" ? "white" : "black");

// pieceKeyとside(任意)から駒画像のsrcを解決する。未知のkeyはnull。
export const pieceImageSrc = (pieceKey: string, side?: Side): string | null => {
  const imageName = imageNameByKey[pieceKey];
  if (!imageName) {
    return null;
  }
  return `${import.meta.env.BASE_URL}piece/futamoji/${colorBySide(side)}_${imageName}.png`;
};
