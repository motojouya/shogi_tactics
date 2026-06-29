import type { FC } from 'react';
import type { CreationForm } from '../form/creation';

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
} from '@mui/material';

import { creationFormSchema } from '../form/creation';
import { registerBattle, startBattle } from '../controller/start';
import { buildNormalUnits } from '../model/unit';
import { NORMAL_STEP_BASE, NORMAL_UNIT_COUNT } from '../model/battle';
import { useIO } from '../components/context';
import { Container } from '../components/utility';

// 通常モード: unitCount=7/stepBase=14固定、units(飛->角->金->銀->桂->香->王、leader=king)もbattle作成時に登録し、編成画面を出さずそのまま開始。
// 戦乱モード: stepBase/unitCountを入力し、登録後の編成画面でunitsを選択する。
// step15(S19/§7.7): pages/new から feature へ移設(BattleNew → BattleCreation)。
// step15(S21/§4.6): versionはページ側の定数を prop で受け取る。
// 検証は form/creation の creationFormSchema(zodResolver)へ委譲し、手書きバリデーションを廃止。
export const BattleCreation: FC<{ version: string }> = ({ version }) => {

  const io = useIO();
  const { local, piece: pieceRepository } = io;

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CreationForm>({
    resolver: zodResolver(creationFormSchema),
    // stepBase/unitCountの既定値は通常モードの値(14/7)。通常モードでは入力欄を出さずこの既定値を使う。
    defaultValues: { mode: 'normal', first_player_name: '', second_player_name: '', stepBase: NORMAL_STEP_BASE, unitCount: NORMAL_UNIT_COUNT },
  });

  // 条件描画(戦乱モードの追加フィールド/ボタン文言)用にmodeをUI stateとして持つ(react-hook-formのwatchはReact Compiler非互換のため)。
  const [mode, setMode] = useState<CreationForm['mode']>('normal');

  const create = async (form: CreationForm) => {
    if (form.mode === 'normal') {
      // 通常モード: 固定パラメータでbattleを作り、default unitsで先頭Turnまで積んでそのまま開始する。
      const battle = await registerBattle(io)(
        form.first_player_name,
        form.second_player_name,
        NORMAL_STEP_BASE,
        NORMAL_UNIT_COUNT,
        version,
      );
      const units = buildNormalUnits((key) => pieceRepository.get(key));
      await startBattle(io)(battle, units);
      local.transit(`/v1/?key=${battle.key}`);
      return;
    }

    // 戦乱モード: stepBase/unitCountはschemaで1以上を保証済みのnumber。登録後の編成画面でunitsを選択する。
    const battle = await registerBattle(io)(
      form.first_player_name,
      form.second_player_name,
      form.stepBase,
      form.unitCount,
      version,
    );
    local.transit(`/v1/?key=${battle.key}`);
  };

  return (
    <Container backLink="/list/">
      <Typography>対戦の設定</Typography>
      <form onSubmit={handleSubmit(create)}>
        <Stack>
          <Box sx={{ p: 1 }}>
            <Controller
              name="mode"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  id="mode"
                  label="Mode"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    setMode(e.target.value as CreationForm['mode']);
                  }}
                  sx={{ width: '100%' }}
                >
                  <MenuItem value="normal">通常モード(7駒固定)</MenuItem>
                  <MenuItem value="war">戦乱モード(駒数自由)</MenuItem>
                </TextField>
              )}
            />
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              id="first_player_name"
              error={!!errors.first_player_name}
              label="先手の名前"
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
              label="後手の名前"
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
                  label="基礎コスト"
                  placeholder="1以上"
                  variant="outlined"
                  {...register('stepBase', { valueAsNumber: true })}
                  helperText={errors.stepBase && errors.stepBase.message}
                  sx={{ width: '100%' }}
                />
              </Box>
              <Box sx={{ p: 1 }}>
                <TextField
                  id="unitCount"
                  type="number"
                  error={!!errors.unitCount}
                  label="ユニット数"
                  placeholder="1以上"
                  variant="outlined"
                  {...register('unitCount', { valueAsNumber: true })}
                  helperText={errors.unitCount && errors.unitCount.message}
                  sx={{ width: '100%' }}
                />
              </Box>
            </>
          )}
          <Box sx={{ p: 1 }}>
            <Button variant="contained" type="submit">
              {mode === 'normal' ? '戦闘開始' : 'ユニット選択'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
