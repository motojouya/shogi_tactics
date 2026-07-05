import type { FC } from 'react';
import type { Battle } from '../model/battle';
import type { Unit, Side } from '../model/unit';
import type { FormationForm } from '../form/formation';

import { nextFormationSide, sideHasLeader, canAddPiece, isFormationComplete } from '../model/unit';

import { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

import { formationFormSchema, pieceSelectOption } from '../form/formation';
import { formatBattle } from '../controller/format';
import { useIO } from '../components/context';
import { Container } from '../components/utility';
import { sideLabel } from '../components/label';
import { FormationUnitList } from '../components/formation_unit_list';

export const BattleFormation: FC<{ battle: Battle }> = ({ battle }) => {

  const io = useIO();
  const { piece: pieceRepository } = io;
  const pieces = pieceRepository.all;

  const [units, setUnits] = useState<Unit[]>([]);

  const { control, handleSubmit, reset } = useForm<FormationForm>({
    resolver: zodResolver(formationFormSchema),
    defaultValues: { piece: pieces[0] ? pieces[0].key : '', leader: false },
  });
  const selectedPiece = useWatch({ control, name: 'piece' });

  const unitCount = battle.unitCount;
  const firstCount = units.filter((unit) => unit.side === 'FIRST').length;
  const secondCount = units.filter((unit) => unit.side === 'SECOND').length;

  const currentSide: Side | null = nextFormationSide(units, unitCount);
  const currentSideHasLeader = currentSide ? sideHasLeader(units, currentSide) : false;
  const canAddSelected = currentSide ? canAddPiece(units, currentSide, selectedPiece) : false;
  const done = isFormationComplete(units, unitCount);

  const playerName = (side: Side): string =>
    side === 'FIRST' ? battle.first_player_name : battle.second_player_name;

  const addUnit = (form: FormationForm) => {
    if (!currentSide) {
      return;
    }
    if (!canAddPiece(units, currentSide, form.piece)) {
      return;
    }
    const piece = pieceRepository.get(form.piece);
    if (!piece) {
      return;
    }
    const asLeader = form.leader && !currentSideHasLeader;
    setUnits([
      ...units,
      { side: currentSide, piece: piece.key, hp: piece.MaxHP, steps: 0, statuses: [], leader: asLeader },
    ]);
    reset({ piece: form.piece, leader: false });
  };

  const undo = () => setUnits(units.slice(0, -1));

  const startGame = async () => {
    await formatBattle(io)(battle, units);
  };

  return (
    <Container backLink="/list/">
      <Stack sx={{ p: 1 }}>
        <Typography>{`${battle.first_player_name}(先手) vs ${battle.second_player_name}(後手) の編成`}</Typography>
        <Typography>{`先手 ${firstCount}/${unitCount} 後手 ${secondCount}/${unitCount}`}</Typography>

        {!done && currentSide && (
          <Stack direction="column" component="form" onSubmit={handleSubmit(addUnit)} sx={{ pt: 2 }}>
            <Typography>{`次は ${sideLabel(currentSide)}(${playerName(currentSide)}) の番です`}</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', pt: 1 }}>
              <Controller
                name="piece"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    id="formation_piece"
                    size="small"
                    value={field.value}
                    onChange={field.onChange}
                    sx={{ minWidth: 160 }}
                  >
                    {pieces.map((piece) => {
                      const option = pieceSelectOption(piece);
                      return (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                      );
                    })}
                  </TextField>
                )}
              />
              <Box sx={{ pl: 1 }}>
                <Button variant="contained" type="submit" disabled={!canAddSelected}>この駒を追加</Button>
              </Box>
            </Stack>
            {!canAddSelected && (
              <Typography color="error" sx={{ pt: 0.5 }}>この駒は既に配置済みです</Typography>
            )}
            <Controller
              name="leader"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value && !currentSideHasLeader}
                      disabled={currentSideHasLeader}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={currentSideHasLeader ? 'リーダーは選択済み' : 'リーダーにする'}
                />
              )}
            />
          </Stack>
        )}

        <FormationUnitList units={units} getPiece={pieceRepository.get} onUndo={undo} />

        {firstCount === unitCount && secondCount === unitCount && !done && (
          <Typography sx={{ pt: 2 }} color="error">
            各陣営ともリーダーを1体ずつ指定してください
          </Typography>
        )}

        {done && (
          <Box sx={{ pt: 2 }}>
            <Button variant="contained" type="button" onClick={startGame}>戦闘開始</Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};
