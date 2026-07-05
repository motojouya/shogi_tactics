import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box, Typography } from '@mui/material';
import { pieceImageSrc } from './piece_image';

/*
 * 9x9将棋盤の解説図。盤画像(CC0, public/board)を背景に、駒画像を実測したマス目へ重ねる。
 * <img>経由のSVGは外部画像を読めない制約があるため、DOM内のインライン描画(背景+絶対配置)で実現する。
 */

const BOARD_SRC = `${import.meta.env.BASE_URL}board/light_458x500.png`;

/*
 * public/board/light_458x500.png をピクセル解析して得たマス目の幾何。
 * 縦線 x:6..451(pitch49.44) / 横線 y:6..493(pitch54.11)。
 */
const IMG_W = 458;
const IMG_H = 500;
const GRID_X0 = 6;
const GRID_Y0 = 6;
const PITCH_X = (451 - 6) / 9;
const PITCH_Y = (493 - 6) / 9;

// col/rowは0始まり(左上が0,0)。マス中心を画像座標で返す。
const cellCenterX = (col: number): number => GRID_X0 + (col + 0.5) * PITCH_X;
const cellCenterY = (row: number): number => GRID_Y0 + (row + 0.5) * PITCH_Y;

export type DiagramCell = { col: number; row: number; piece: string; side: Side };
// マスのハイライト(配置可能範囲など)。cols/rowsは[開始, 終了]の閉区間。
export type DiagramHighlight = { cols: [number, number]; rows: [number, number]; color: string };
// 矢印(足止めの動きなど)。from/toはマス座標(小数可)。dashed=本来進みたいが進めない経路を破線で示す。
export type DiagramArrow = { from: [number, number]; to: [number, number]; dashed?: boolean; color?: string };

export const BoardDiagram: FC<{
  cells: DiagramCell[];
  highlights?: DiagramHighlight[];
  arrows?: DiagramArrow[];
  caption?: string;
}> = ({ cells, highlights = [], arrows = [], caption }) => (
  <Box sx={{ my: 2 }}>
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 360,
        aspectRatio: `${IMG_W} / ${IMG_H}`,
        mx: 'auto',
        backgroundImage: `url(${BOARD_SRC})`,
        backgroundSize: '100% 100%',
      }}
    >
      <Box
        component="svg"
        viewBox={`0 0 ${IMG_W} ${IMG_H}`}
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      >
        <defs>
          <marker id="diagram-arrowhead" markerWidth="5" markerHeight="5" refX="3.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="context-stroke" />
          </marker>
        </defs>
        {highlights.map((h, i) => {
          const x = GRID_X0 + h.cols[0] * PITCH_X;
          const y = GRID_Y0 + h.rows[0] * PITCH_Y;
          const w = (h.cols[1] - h.cols[0] + 1) * PITCH_X;
          const ht = (h.rows[1] - h.rows[0] + 1) * PITCH_Y;
          return <rect key={`hl-${i}`} x={x} y={y} width={w} height={ht} fill={h.color} opacity={0.35} />;
        })}
        {arrows.map((a, i) => (
          <line
            key={`ar-${i}`}
            x1={cellCenterX(a.from[0])}
            y1={cellCenterY(a.from[1])}
            x2={cellCenterX(a.to[0])}
            y2={cellCenterY(a.to[1])}
            stroke={a.color ?? '#d32f2f'}
            strokeWidth={5}
            strokeDasharray={a.dashed ? '8 6' : undefined}
            markerEnd="url(#diagram-arrowhead)"
          />
        ))}
      </Box>
      {cells.map((cell, i) => {
        const src = pieceImageSrc(cell.piece, cell.side);
        if (!src) {
          return null;
        }
        return (
          <Box
            key={`cell-${i}`}
            component="img"
            src={src}
            alt={cell.piece}
            sx={{
              position: 'absolute',
              left: `${(cellCenterX(cell.col) / IMG_W) * 100}%`,
              top: `${(cellCenterY(cell.row) / IMG_H) * 100}%`,
              width: `${(PITCH_X / IMG_W) * 100 * 0.92}%`,
              height: 'auto',
              transform: 'translate(-50%, -50%)',
            }}
          />
        );
      })}
    </Box>
    {caption && (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
        {caption}
      </Typography>
    )}
  </Box>
);
