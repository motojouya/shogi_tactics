import type { FC } from 'react';
import type { Battle } from '../model/battle';
import type { Unit, Side } from '../model/unit';
import type { FormationForm } from '../form/formation';

import { nextFormationSide, sideHasLeader, canAddPiece, isFormationComplete } from '../model/unit';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { startBattle } from '../controller/start';
import { useIO } from '../components/context';
import { Container } from '../components/utility';
import { sideLabel } from '../components/label';

// step6: 編成段階(battle.turns.length===0)のUI。
// 先手→後手の交互に1unitずつ選び、双方がunitCountに達したら戦闘を開始できる。
// 「駒を追加」フォームの入力はform/formationのformationFormSchema(zodResolver)で検証する。
export const BattleFormation: FC<{ battle: Battle }> = ({ battle }) => {

  const io = useIO();
  const { piece: pieceRepository } = io;
  const pieces = pieceRepository.all;

  const [units, setUnits] = useState<Unit[]>([]);

  const { control, handleSubmit, reset } = useForm<FormationForm>({
    resolver: zodResolver(formationFormSchema),
    defaultValues: { piece: pieces[0] ? pieces[0].key : '', leader: false },
  });
  // 選択中の駒(駒重複判定に使う)はUI stateとして持つ(react-hook-formのwatchはReact Compiler非互換のため)。
  const [selectedPiece, setSelectedPiece] = useState<string>(pieces[0] ? pieces[0].key : '');

  const unitCount = battle.unitCount;
  // 進捗表示用のカウント(ゲームルールではない単なる集計)。
  const firstCount = units.filter((unit) => unit.side === 'FIRST').length;
  const secondCount = units.filter((unit) => unit.side === 'SECOND').length;

  // ゲームルール(次の手番/大将1体制限/編成完了/駒重複)はmodelの検証関数へ委譲する(§2.3)。
  const currentSide: Side | null = nextFormationSide(units, unitCount);
  const currentSideHasLeader = currentSide ? sideHasLeader(units, currentSide) : false;
  // 同陣営に同じ駒は二重に置けない。選択中の駒が追加可能かを判定しUIに反映する。
  const canAddSelected = currentSide ? canAddPiece(units, currentSide, selectedPiece) : false;
  const done = isFormationComplete(units, unitCount);

  const playerName = (side: Side): string =>
    side === 'FIRST' ? battle.first_player_name : battle.second_player_name;

  const addUnit = (form: FormationForm) => {
    if (!currentSide) {
      return;
    }
    // 駒重複は不可(modelのcanAddPieceで判定済み)。
    if (!canAddPiece(units, currentSide, form.piece)) {
      return;
    }
    const piece = pieceRepository.get(form.piece);
    if (!piece) {
      return;
    }
    // leaderは陣営1体まで。既に居る場合は強制的にfalse。
    const asLeader = form.leader && !currentSideHasLeader;
    setUnits([
      ...units,
      { side: currentSide, piece: piece.key, hp: piece.MaxHP, steps: 0, statuses: [], leader: asLeader },
    ]);
    // 駒選択は維持し、大将チェックのみ戻す。
    reset({ piece: form.piece, leader: false });
  };

  const undo = () => setUnits(units.slice(0, -1));

  const startGame = async () => {
    // 先頭Turnを積んで保存。useLiveQueryがturns更新を検知し戦闘画面へ切り替わる。
    await startBattle(io)(battle, units);
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
                    size="small"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedPiece(e.target.value);
                    }}
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
                  label={currentSideHasLeader ? '大将は選択済み' : '大将にする'}
                />
              )}
            />
          </Stack>
        )}

        <Stack direction="column" sx={{ pt: 2 }}>
          {units.map((unit, index) => {
            const piece = pieceRepository.get(unit.piece);
            return (
              <Stack
                key={`formation-unit-${index}`}
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}
              >
                <Typography>{`${sideLabel(unit.side)}: ${piece ? piece.name : unit.piece}${unit.leader ? ' [大将]' : ''}`}</Typography>
                {index === units.length - 1 && (
                  <Button variant="outlined" type="button" onClick={undo}>取消</Button>
                )}
              </Stack>
            );
          })}
        </Stack>

        {firstCount === unitCount && secondCount === unitCount && !done && (
          <Typography sx={{ pt: 2 }} color="error">
            各陣営とも大将を1体ずつ指定してください
          </Typography>
        )}

        {done && (
          <Box sx={{ pt: 2 }}>
            <Button variant="contained" type="button" onClick={startGame}>Start Battle</Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};
