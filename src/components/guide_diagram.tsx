import type { FC } from 'react';
import type { Side } from '../model/unit';
import { Box, Stack, Typography } from '@mui/material';
import { BoardDiagram } from './board_diagram';
import type { DiagramCell, DiagramHighlight, DiagramArrow } from './board_diagram';
import { PieceImage } from './piece_image';

/*
 * guide(markdown)に埋め込む解説図。markdownのimage `![alt](diagram:KEY)` から本コンポーネントへ振り分ける。
 * 盤面図は実際の駒画像と盤画像を組み合わせる(board_diagram)。配置は各markdownのASCII/説明に対応。
 */

// #1 初期配置(tutorial.md)。上=後手(奥)/下=先手(手前)。
const INITIAL_CELLS: DiagramCell[] = [
  // 後手
  { col: 2, row: 0, piece: 'rook', side: 'SECOND' },
  { col: 3, row: 0, piece: 'knight', side: 'SECOND' },
  { col: 4, row: 0, piece: 'king', side: 'SECOND' },
  { col: 5, row: 0, piece: 'lance', side: 'SECOND' },
  { col: 6, row: 0, piece: 'bishop', side: 'SECOND' },
  { col: 3, row: 1, piece: 'silver', side: 'SECOND' },
  { col: 5, row: 1, piece: 'gold', side: 'SECOND' },
  // 先手
  { col: 3, row: 7, piece: 'gold', side: 'FIRST' },
  { col: 5, row: 7, piece: 'silver', side: 'FIRST' },
  { col: 2, row: 8, piece: 'bishop', side: 'FIRST' },
  { col: 3, row: 8, piece: 'lance', side: 'FIRST' },
  { col: 4, row: 8, piece: 'king', side: 'FIRST' },
  { col: 5, row: 8, piece: 'knight', side: 'FIRST' },
  { col: 6, row: 8, piece: 'rook', side: 'FIRST' },
];

// #2 足止め(tutorial.md)。後手の香車(薙刀, 6四=col3,row3)が6筋を直進しようとするが、
// 足止めを持つ先手金(重装兵, 7六=col2,row5)の隣接マス6六(col3,row5)で必ず停止し、本来進みたい6七(col3,row6)へ進めない。
const ASHIDOME_CELLS: DiagramCell[] = [
  // 後手
  { col: 4, row: 0, piece: 'king', side: 'SECOND' },
  { col: 2, row: 2, piece: 'rook', side: 'SECOND' },
  { col: 6, row: 2, piece: 'bishop', side: 'SECOND' },
  { col: 2, row: 3, piece: 'silver', side: 'SECOND' },
  { col: 3, row: 3, piece: 'lance', side: 'SECOND' },
  { col: 5, row: 3, piece: 'knight', side: 'SECOND' },
  { col: 6, row: 3, piece: 'gold', side: 'SECOND' },
  // 先手
  { col: 2, row: 5, piece: 'gold', side: 'FIRST' },
  { col: 5, row: 5, piece: 'silver', side: 'FIRST' },
  { col: 6, row: 5, piece: 'knight', side: 'FIRST' },
  { col: 1, row: 6, piece: 'lance', side: 'FIRST' },
  { col: 2, row: 6, piece: 'bishop', side: 'FIRST' },
  { col: 5, row: 7, piece: 'rook', side: 'FIRST' },
  { col: 4, row: 8, piece: 'king', side: 'FIRST' },
];
// 実線=実際に動ける範囲(6六で停止)。破線=足止めで進めない6七への経路。
const ASHIDOME_ARROWS: DiagramArrow[] = [
  { from: [3, 3.55], to: [3, 5] },
  { from: [3, 5.15], to: [3, 6], dashed: true, color: '#9e9e9e' },
];
// 赤=足止めする先手金(7六)。青=香車が停止するマス(6六)。
const ASHIDOME_HIGHLIGHTS: DiagramHighlight[] = [
  { cols: [2, 2], rows: [5, 5], color: '#d32f2f' },
  { cols: [3, 3], rows: [5, 5], color: 'royalblue' },
];

// #4 配置可能マス(turbulent.md)。自軍側2マス分の幅に自由配置できる。先手=手前(下2行)/後手=奥(上2行)。
const PLACEABLE_HIGHLIGHTS: DiagramHighlight[] = [
  { cols: [0, 8], rows: [7, 8], color: 'royalblue' },
  { cols: [0, 8], rows: [0, 1], color: '#d32f2f' },
];

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

const sideMark = (side: Side): string => (side === 'FIRST' ? '先' : '後');

const CostPaperDiagram: FC<{ caption?: string }> = ({ caption }) => {
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

// markdownの `diagram:KEY` から解説図を振り分ける。
export const GuideDiagram: FC<{ name: string; alt?: string }> = ({ name, alt }) => {
  switch (name) {
    case 'initial':
      return <BoardDiagram cells={INITIAL_CELLS} caption={alt} />;
    case 'ashidome':
      return (
        <BoardDiagram
          cells={ASHIDOME_CELLS}
          arrows={ASHIDOME_ARROWS}
          highlights={ASHIDOME_HIGHLIGHTS}
          caption={alt}
        />
      );
    case 'placeable':
      return <BoardDiagram cells={[]} highlights={PLACEABLE_HIGHLIGHTS} caption={alt} />;
    case 'cost-paper':
      return <CostPaperDiagram caption={alt} />;
    default:
      return null;
  }
};
