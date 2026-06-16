import type { FC } from 'react';
import type { Unit } from '../../model/unit';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { SelectUnits } from '../../components/unit';
import { startBattle } from '../../procedure/battle/start';
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
  // step6: party選択を廃止し、piece選択でside別にunitsを組む。
  const [firstUnits, setFirstUnits] = useState<Unit[]>([]);
  const [secondUnits, setSecondUnits] = useState<Unit[]>([]);

  // version v1では保存文字列のみ(ルール分岐は持たない)。default値として固定で付与する。
  const version = 'v1';

  // FIXME
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const start = async (battleForm: any) => {
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
    // unitCountはparty駒数との整合は見ず、入力値をそのまま採用する
    const unitCount = Number(battleForm.unitCount);
    if (!battleForm.unitCount || Number.isNaN(unitCount) || unitCount < 1) {
      messages.push('unitCountは1以上の数値を入力してください');
    }

    const units = [...firstUnits, ...secondUnits];
    if (units.length === 0) {
      messages.push('駒を1つ以上選択してください');
    }

    if (messages.length > 0) {
      setMessage(messages.join('\n'));
      return;
    }

    const battle = await startBattle(battleRepository, dialogue)(
      units,
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
      <form onSubmit={handleSubmit(start)}>
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
              placeholder="ユニット数(1以上)"
              variant="outlined"
              {...register('unitCount')}
              helperText={errors.unitCount && errors.unitCount.message}
              sx={{ width: '100%' }}
            />
          </Box>
          <Box sx={{ p: 1 }}>
            <SelectUnits side="FIRST" label="先手の駒" units={firstUnits} setUnits={setFirstUnits} />
          </Box>
          <Box sx={{ p: 1 }}>
            <SelectUnits side="SECOND" label="後手の駒" units={secondUnits} setUnits={setSecondUnits} />
          </Box>
          <Box sx={{ p: 1 }}>
            <Button variant="contained" type="submit">Start Battle</Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
