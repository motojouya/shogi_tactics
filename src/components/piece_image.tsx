import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box } from '@mui/material';
import { pieceImageSrc } from './piece_image_src';

// 駒画像。pieceKeyとside(任意)から画像を解決する。altは表示名(name)を渡す想定。
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
