import type { FC } from 'react';
import type { Unit } from '../model/unit';
import type { GetPiece } from '../model/piece';

import { Button, Stack, Typography } from '@mui/material';

import { sideLabel } from './label';
import { PieceImage } from './piece_image';

export const FormationUnitList: FC<{
  units: Unit[];
  getPiece: GetPiece;
  onUndo: () => void;
}> = ({ units, getPiece, onUndo }) => (
  <Stack direction="column" sx={{ pt: 2 }}>
    {units.map((unit, index) => {
      const piece = getPiece(unit.piece);
      return (
        <Stack
          key={`formation-unit-${index}`}
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', columnGap: 1 }}>
            <Typography sx={{ color: 'text.secondary', minWidth: 24 }}>{`${index + 1}.`}</Typography>
            <PieceImage pieceKey={unit.piece} side={unit.side} name={piece?.name} size={28} />
            <Typography>{`${sideLabel(unit.side)}: ${piece ? `${piece.name}（${piece.shogiName}）` : unit.piece}${unit.leader ? ' [リーダー]' : ''}`}</Typography>
          </Stack>
          {index === units.length - 1 && (
            <Button variant="outlined" type="button" onClick={onUndo}>取消</Button>
          )}
        </Stack>
      );
    })}
  </Stack>
);
