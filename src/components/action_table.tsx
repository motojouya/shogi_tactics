import type { FC } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Action } from '../model/action';

// 1マスの一辺(px)。到達範囲(7×7)・対象範囲(3×3)を小さく描くため控えめにする。
const CELL = 9;

// action.tsのbit意味付け(bit0=影響あり, bit1=Actorのマス)に従い、1マスを色と枠で可視化する。
// - 影響あり: 塗り(青)
// - Actorのマス: 赤枠
const RangeGrid: FC<{ grid: number[][] }> = ({ grid }) => {
  const cols = grid[0]?.length ?? 0;
  return (
    <Box
      sx={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
        gap: '1px',
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const isEffect = (cell & 1) === 1;
          const isActor = (cell & 2) === 2;
          return (
            <Box
              key={`${r}-${c}`}
              sx={{
                width: `${CELL}px`,
                height: `${CELL}px`,
                backgroundColor: isEffect ? 'royalblue' : '#eeeeee',
                outline: isActor ? '1px solid #d32f2f' : undefined,
                outlineOffset: '-1px',
              }}
            />
          );
        }),
      )}
    </Box>
  );
};

// 駒が持つ行動(action)の一覧表。guide/pieceと戦闘中アコーディオンで共用する。
// 到達範囲/対象範囲は数値ではなくマス目グリッドで可視化する。
export const ActionTable: FC<{ actions: Action[] }> = ({ actions }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      範囲: 青=影響あり / 赤枠=行動主のマス
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>行動</TableCell>
          <TableCell>説明</TableCell>
          <TableCell align="right">基本ダメージ</TableCell>
          <TableCell align="right">対象数</TableCell>
          <TableCell align="right">コスト</TableCell>
          <TableCell align="center">到達範囲</TableCell>
          <TableCell align="center">対象範囲</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {actions.map((action) => (
          <TableRow key={action.key}>
            <TableCell>{action.name}</TableCell>
            <TableCell>{action.description}</TableCell>
            <TableCell align="right">{action.baseDamage}</TableCell>
            <TableCell align="right">{action.receiverCount}</TableCell>
            <TableCell align="right">{action.cost}</TableCell>
            <TableCell align="center">
              <RangeGrid grid={action.reachRange} />
            </TableCell>
            <TableCell align="center">
              <RangeGrid grid={action.effectRange} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);
