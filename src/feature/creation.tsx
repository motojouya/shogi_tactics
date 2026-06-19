import type { FC } from 'react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { registerBattle, startBattle } from '../controller/start';
import { buildNormalUnits } from '../model/unit';
import { NORMAL_STEP_BASE, NORMAL_UNIT_COUNT } from '../model/battle';
import { useIO } from '../components/context';
import { Container } from '../components/utility';

// 通常モード: unitCount=7/stepBase=14固定、units(飛->角->金->銀->桂->香->王、leader=king)もbattle作成時に登録し、編成画面を出さずそのまま開始。
// 戦乱モード: stepBase/unitCountを入力し、登録後の編成画面でunitsを選択する。
type Mode = 'normal' | 'war';

// step15(S19/§7.7): battle作成画面。pages/new から feature へ移設(BattleNew → BattleCreation)。
// step15(S21/§4.6): versionはページ側の定数を prop で受け取る(ハードコードを排除)。
export const BattleCreation: FC<{ version: string }> = ({ version }) => {

  const io = useIO();
  const { local, piece: pieceRepository } = io;

  const [mode, setMode] = useState<Mode>('normal');
  const [message, setMessage] = useState<string>('');
  // FIXME stepBaseとunitCountはまとめて構造体(メタパラメータ)にしたい。現段階では個別フィールドのまま。
  const {
    handleSubmit,
    register,
    formState: { errors }, //, isSubmitting
  } = useForm<{ first_player_name: string; second_player_name: string; stepBase: string; unitCount: string }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const register_ = async (battleForm: any) => {
    const messages: string[] = [];

    const firstPlayerName = battleForm.first_player_name as string;
    const secondPlayerName = battleForm.second_player_name as string;
    if (!firstPlayerName) {
      messages.push('先手のプレイヤー名を入力してください');
    }
    if (!secondPlayerName) {
      messages.push('後手のプレイヤー名を入力してください');
    }

    if (mode === 'normal') {
      if (messages.length > 0) {
        setMessage(messages.join('\n'));
        return;
      }
      // 通常モード: 固定パラメータでbattleを作り、default unitsで先頭Turnまで積んでそのまま開始する。
      const battle = await registerBattle(io)(
        firstPlayerName,
        secondPlayerName,
        NORMAL_STEP_BASE,
        NORMAL_UNIT_COUNT,
        version,
      );
      const units = buildNormalUnits((key) => pieceRepository.get(key));
      await startBattle(io)(battle, units);
      local.transit(`/v1/?key=${battle.key}`);
      return;
    }

    // 戦乱モード: stepBase/unitCountを入力で受け取り、登録後の編成画面でunitsを選択する。
    const stepBase = Number(battleForm.stepBase);
    if (!battleForm.stepBase || Number.isNaN(stepBase) || stepBase < 1) {
      messages.push('stepBaseは1以上の数値を入力してください');
    }
    // unitCountは先手/後手それぞれの駒数。編成画面でこの数に達したら開始できる。
    const unitCount = Number(battleForm.unitCount);
    if (!battleForm.unitCount || Number.isNaN(unitCount) || unitCount < 1) {
      messages.push('unitCountは1以上の数値を入力してください');
    }

    if (messages.length > 0) {
      setMessage(messages.join('\n'));
      return;
    }

    const battle = await registerBattle(io)(
      firstPlayerName,
      secondPlayerName,
      stepBase,
      unitCount,
      version,
    );
    local.transit(`/v1/?key=${battle.key}`);
  };

  // FIXME messageの表示で以前はFormErrorMessageを使っていたがchakra v3ではなくなったため、一旦Textで代用
  // FIXME Button loading={isSubmitting} loadingText="Starting Battle..." としたかったがloadingがエラーになる
  return (
    <Container backLink="/list/">
      <Typography>Start The Battle</Typography>
      <form onSubmit={handleSubmit(register_)}>
        <Stack>
          {message && (
            <Box sx={{ p: 1 }}>
              <Typography>{message}</Typography>
            </Box>
          )}
          <Box sx={{ p: 1 }}>
            <TextField
              select
              id="mode"
              label="Mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              sx={{ width: '100%' }}
            >
              <MenuItem value="normal">通常モード(7駒固定)</MenuItem>
              <MenuItem value="war">戦乱モード(駒数自由)</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              id="first_player_name"
              error={!!errors.first_player_name}
              label="First Player Name"
              placeholder="先手の名前"
              variant="outlined"
              {...register('first_player_name')}
              helperText={errors.first_player_name && errors.first_player_name.message}
              sx={{ width: '100%' }}
            />
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              id="second_player_name"
              error={!!errors.second_player_name}
              label="Second Player Name"
              placeholder="後手の名前"
              variant="outlined"
              {...register('second_player_name')}
              helperText={errors.second_player_name && errors.second_player_name.message}
              sx={{ width: '100%' }}
            />
          </Box>
          {mode === 'war' && (
            <>
              <Box sx={{ p: 1 }}>
                <TextField
                  id="stepBase"
                  type="number"
                  error={!!errors.stepBase}
                  label="Step Base"
                  placeholder="基礎コスト(1以上)"
                  variant="outlined"
                  {...register('stepBase')}
                  helperText={errors.stepBase && errors.stepBase.message}
                  sx={{ width: '100%' }}
                />
              </Box>
              <Box sx={{ p: 1 }}>
                <TextField
                  id="unitCount"
                  type="number"
                  error={!!errors.unitCount}
                  label="Unit Count"
                  placeholder="片側のユニット数(1以上)"
                  variant="outlined"
                  {...register('unitCount')}
                  helperText={errors.unitCount && errors.unitCount.message}
                  sx={{ width: '100%' }}
                />
              </Box>
            </>
          )}
          <Box sx={{ p: 1 }}>
            <Button variant="contained" type="submit">
              {mode === 'normal' ? 'Start Battle' : 'Register Battle'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
