/* eslint react-refresh/only-export-components: 0 */
import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box } from '@mui/material';

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

/*
 * 先手=black/後手=white。white画像は180度回転済みなので後手向きはそのまま自然に表示される。
 * sideを指定しない箇所(guide/piece等)は先手の駒を表示する。
 */
const colorBySide = (side: Side | undefined): 'black' | 'white' => (side === 'SECOND' ? 'white' : 'black');

export const pieceImageSrc = (pieceKey: string, side?: Side): string | null => {
  const imageName = imageNameByKey[pieceKey];
  if (!imageName) {
    return null;
  }
  return `${import.meta.env.BASE_URL}piece/${colorBySide(side)}_${imageName}.png`;
};

export const PieceImage: FC<{ pieceKey: string; side?: Side; name?: string; size?: number }> = ({
  pieceKey,
  side,
  name,
  size = 28,
}) => {
  const src = pieceImageSrc(pieceKey, side);
  if (!src) {
    return null;
  }
  return (
    <Box
      component="img"
      src={src}
      alt={name ?? pieceKey}
      sx={{ width: `${size}px`, height: 'auto', display: 'block', flexShrink: 0 }}
    />
  );
};
