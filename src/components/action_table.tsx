import type { FC } from 'react';
import {
  Box,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Action } from '../model/action';

const CELL = 9;

/*
 * action.tsのbit意味付け(bit0=影響あり, bit1=Actorのマス)に従い、1マスを色と枠で可視化する。
 * - 影響あり: 塗り(青)
 * - Actorのマス: 赤枠
 */
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

const RangeLabeled: FC<{ label: string; grid: number[][] }> = ({ label, grid }) => (
  <Stack sx={{ alignItems: 'center', rowGap: 0.5 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <RangeGrid grid={grid} />
  </Stack>
);

// 画面幅が広いとき: 1行1actionの表。列が多く横に長い。
const ActionWideTable: FC<{ actions: Action[] }> = ({ actions }) => (
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
);

// 画面幅が狭いとき(スマホ): 表を横に並べず、action単位で縦積みにして情報を詰める。表示内容は表と同じ。
const ActionCardList: FC<{ actions: Action[] }> = ({ actions }) => (
  <Stack spacing={1} divider={<Divider />} sx={{ mt: 1 }}>
    {actions.map((action) => (
      <Stack key={action.key} sx={{ rowGap: 0.5 }}>
        <Typography variant="subtitle2">{action.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {action.description}
        </Typography>
        <Typography variant="body2">
          {`基本ダメージ ${action.baseDamage} ・ 対象数 ${action.receiverCount} ・ コスト ${action.cost}`}
        </Typography>
        <Stack direction="row" sx={{ columnGap: 3, pt: 0.5 }}>
          <RangeLabeled label="到達範囲" grid={action.reachRange} />
          <RangeLabeled label="対象範囲" grid={action.effectRange} />
        </Stack>
      </Stack>
    ))}
  </Stack>
);

export const ActionTable: FC<{ actions: Action[] }> = ({ actions }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">
      範囲: 青=影響あり / 赤枠=行動主のマス
    </Typography>
    {/* 広い画面は表、スマホ幅(xs)は縦積みカードに切り替える。表示内容は同一。 */}
    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
      <ActionWideTable actions={actions} />
    </Box>
    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
      <ActionCardList actions={actions} />
    </Box>
  </Box>
);
