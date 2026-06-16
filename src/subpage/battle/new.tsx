import type { FC } from 'react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { registerBattle } from '../../procedure/battle/start';
import { useIO } from '../../components/context';
import { transit } from '../../components/utility';
import { Container } from '../../components/utility';

export const BattleNew: FC = () => {

  const { battleRepository, dialogue } = useIO();

  const [message, setMessage] = useState<string>('');
  // FIXME stepBaseとunitCountはまとめて構造体(メタパラメータ)にしたい。現段階では個別フィールドのまま。
  const {
    handleSubmit,
    register,
    formState: { errors }, //, isSubmitting
  } = useForm<{ first_player_name: string; second_player_name: string; stepBase: string; unitCount: string }>();

  // version v1では保存文字列のみ(ルール分岐は持たない)。default値として固定で付与する。
  const version = 'v1';

  // step6: ここではbattleの骨格(turns=[])のみ登録する。unitsの選択は登録後のbattle画面(編成段階)で行う。
  // FIXME
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

    const battle = await registerBattle(battleRepository, dialogue)(
      firstPlayerName,
      secondPlayerName,
      stepBase,
      unitCount,
      version,
    );
    transit(`/battle/?key=${battle.key}`);
  };

  // FIXME messageの表示で以前はFormErrorMessageを使っていたがchakra v3ではなくなったため、一旦Textで代用
  // FIXME Button loading={isSubmitting} loadingText="Starting Battle..." としたかったがloadingがエラーになる
  return (
    <Container backLink="/battle/">
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
          <Box sx={{ p: 1 }}>
            <Button variant="contained" type="submit">Register Battle</Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
