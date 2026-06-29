import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box } from '@mui/material';

// piece key -> shogi-images(futamoji)のファイル名。多くはkeyと同名だが、成り駒のみ別名。
// 画像はCC0(sunfish-shogi/shogi-images)を public/piece/futamoji に同梱している。
const imageNameByKey: Record<string, string> = {
  king: 'king',
  gold: 'gold',
  silver: 'silver',
  rook: 'rook',
  bishop: 'bishop',
  knight: 'knight',
  lance: 'lance',
  dragon: 'dragon',
  horse: 'horse',
  promotedSilver: 'prom_silver',
  promotedKnight: 'prom_knight',
  promotedLance: 'prom_lance',
  pawn: 'pawn',
  promotedPawn: 'prom_pawn',
};

// 先手=black/後手=white。sideを指定しない箇所(guide/piece等)は先手の駒を表示する。
const colorBySide = (side: Side | undefined): 'black' | 'white' =>
  side === 'SECOND' ? 'white' : 'black';

// 駒画像。pieceKeyとside(任意)から画像を解決する。altは表示名(name)を渡す想定。
export const PieceImage: FC<{ pieceKey: string; side?: Side; name?: string; size?: number }> = ({
  pieceKey,
  side,
  name,
  size = 28,
}) => {
  const imageName = imageNameByKey[pieceKey];
  if (!imageName) {
    return null;
  }
  const src = `${import.meta.env.BASE_URL}piece/futamoji/${colorBySide(side)}_${imageName}.png`;
  return (
    <Box
      component="img"
      src={src}
      alt={name ?? pieceKey}
      sx={{ width: `${size}px`, height: 'auto', display: 'block', flexShrink: 0 }}
    />
  );
};
