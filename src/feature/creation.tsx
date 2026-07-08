import type { FC } from 'react';
import type { CreationForm } from '../form/creation';

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
} from '@mui/material';

import { creationFormSchema, creationFormDefault } from '../form/creation';
import { createBattle } from '../controller/create';
import { InvalidArgumentError } from '../model/error';
import { useIO } from '../components/context';
import { Container } from '../components/utility';

export const BattleCreation: FC<{ version: string }> = ({ version }) => {
  const io = useIO();
  const { local } = io;

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<CreationForm>({
    resolver: zodResolver(creationFormSchema),
    defaultValues: creationFormDefault,
  });

  const mode = useWatch({ control, name: 'mode' });

  const [message, setMessage] = useState('');

  const create = async (form: CreationForm) => {
    const battle = await createBattle(io)(form, version);
    if (battle instanceof InvalidArgumentError) {
      setMessage(battle.message);
      return;
    }
    setMessage('');
    local.transit(`/v1/?key=${battle.key}`);
  };

  return (
    <Container backLink="/list/">
      <Typography>対戦の設定</Typography>
      {message && (
        <Typography color="error" sx={{ p: 1 }}>
          {message}
        </Typography>
      )}
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
                  label="モード"
                  value={field.value}
                  onChange={field.onChange}
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
              label="先手のプレイヤー名"
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
              label="後手のプレイヤー名"
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
                  placeholder="1〜999"
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
                  label="駒数"
                  placeholder="1〜14"
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
              {mode === 'normal' ? '対戦開始' : '駒の選択'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
