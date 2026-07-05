import type { FC } from 'react';
import { BoardDiagram } from './board_diagram';
import type { DiagramCell, DiagramHighlight, DiagramArrow } from './board_diagram';
import { CostPaperDiagram } from './cost_paper_diagram';

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
