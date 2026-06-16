import type { FC } from 'react';
import type { Unit, Side } from '../model/unit';

import { useState } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { pieceRepository } from '../store/piece';

// step6: pieceを選んでside別にunitを積む。piece実体の参照はここでのみ行い、Unitはキーのみ保持する。
export const SelectUnits: FC<{
  side: Side,
  label: string,
  units: Unit[],
  setUnits: (units: Unit[]) => void,
}> = ({ side, label, units, setUnits }) => {

  const pieces = pieceRepository.all;
  const [selected, setSelected] = useState<string>(pieces[0] ? pieces[0].key : '');

  const addUnit = () => {
    const piece = pieceRepository.get(selected);
    if (!piece) {
      return;
    }
    setUnits([...units, { side, piece: piece.key, hp: piece.MaxHP, steps: 0, statuses: [] }]);
  };

  const removeUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index));
  };

  return (
    <Stack direction="column" sx={{ width: '100%' }}>
      <Typography>{label}</Typography>
      <Stack direction="row" sx={{ alignItems: 'center', pt: 1 }}>
        <TextField
          select
          size="small"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          {pieces.map((piece) => (
            <MenuItem key={piece.key} value={piece.key}>{piece.name}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ pl: 1 }}>
          <Button variant="contained" type="button" onClick={addUnit}>追加</Button>
        </Box>
      </Stack>
      <Stack direction="column" sx={{ pt: 1 }}>
        {units.map((unit, index) => {
          const piece = pieceRepository.get(unit.piece);
          return (
            <Stack
              key={`${side}-unit-${index}`}
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}
            >
              <Typography>{piece ? piece.name : unit.piece}</Typography>
              <Button variant="outlined" type="button" onClick={() => removeUnit(index)}>削除</Button>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
