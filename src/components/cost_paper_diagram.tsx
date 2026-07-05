import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box, Stack, Typography } from '@mui/material';
import { PieceImage } from './piece_image';
import { sideMark } from './label';

// #3 紙でのターン管理(offscreen.md)。通常モードの初期行動順(tutorial.md)に、加算コストの例を添える。
type CostRow = { piece: string; side: Side; name: string; cost: number };
const COST_ROWS: CostRow[] = [
  { piece: 'rook', side: 'FIRST', name: '飛車', cost: 11 },
  { piece: 'rook', side: 'SECOND', name: '飛車', cost: 9 },
  { piece: 'bishop', side: 'FIRST', name: '角行', cost: 7 },
  { piece: 'bishop', side: 'SECOND', name: '角行', cost: 14 },
  { piece: 'gold', side: 'FIRST', name: '金将', cost: 2 },
  { piece: 'gold', side: 'SECOND', name: '金将', cost: 4 },
  { piece: 'silver', side: 'FIRST', name: '銀将', cost: 9 },
  { piece: 'silver', side: 'SECOND', name: '銀将', cost: 2 },
  { piece: 'knight', side: 'FIRST', name: '桂馬', cost: 16 },
  { piece: 'knight', side: 'SECOND', name: '桂馬', cost: 11 },
  { piece: 'lance', side: 'FIRST', name: '香車', cost: 7 },
  { piece: 'lance', side: 'SECOND', name: '香車', cost: 9 },
  { piece: 'king', side: 'FIRST', name: '王将', cost: 2 },
  { piece: 'king', side: 'SECOND', name: '王将', cost: 4 },
];

export const CostPaperDiagram: FC<{ caption?: string }> = ({ caption }) => {
  // 合計が最小の駒が次に動く。同点は初期順(=配列の先頭側)。先頭から探して最初の最小行を「次の番」とする。
  const minCost = Math.min(...COST_ROWS.map((row) => row.cost));
  const nextIndex = COST_ROWS.findIndex((row) => row.cost === minCost);
  return (
    <Box sx={{ my: 2 }}>
      <Box
        sx={{
          maxWidth: 360,
          mx: 'auto',
          p: 1.5,
          backgroundColor: '#fffdf5',
          border: '1px solid #d8d2bd',
          borderRadius: 1,
          boxShadow: '2px 2px 6px rgba(0,0,0,0.15)',
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          行動順メモ
        </Typography>
        <Stack divider={<Box sx={{ borderBottom: '1px dashed #e0dac5' }} />}>
          {COST_ROWS.map((row, index) => (
            <Stack
              key={`${row.side}-${row.piece}`}
              direction="row"
              sx={{
                alignItems: 'center',
                columnGap: 1,
                py: 0.4,
                backgroundColor: index === nextIndex ? 'rgba(65,105,225,0.12)' : undefined,
              }}
            >
              <Typography variant="body2" sx={{ width: 18, color: 'text.secondary' }}>
                {index + 1}
              </Typography>
              <PieceImage pieceKey={row.piece} side={row.side} name={row.name} size={22} />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {`${row.name}（${sideMark(row.side)}）`}
              </Typography>
              <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {`コスト ${row.cost}`}
              </Typography>
              {index === nextIndex && (
                <Typography variant="caption" color="primary" sx={{ whiteSpace: 'nowrap' }}>
                  ← 次の番
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          行動コスト: 何もしない0 / 低い行動2 / 高い行動7
        </Typography>
      </Box>
      {caption && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.5 }}>
          {caption}
        </Typography>
      )}
    </Box>
  );
};
