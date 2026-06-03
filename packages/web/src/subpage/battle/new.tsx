import type { FC } from 'react';
import type { Party } from '@motojouya/kniw-core/model/party';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { ImportParty } from '../../components/party';
import { startBattle } from '../../procedure/battle/start';
import { useIO } from '../../components/context';
import { transit } from '../../components/utility';
import { Container } from '../../components/utility';

export const BattleNew: FC = () => {

  const { battleRepository } = useIO();

  const [message, setMessage] = useState<string>('');
  const {
    handleSubmit,
    register,
    formState: { errors }, //, isSubmitting
  } = useForm<{ title: string }>();
  const [homeParty, setHomeParty] = useState<Party | null>(null);
  const [visitorParty, setVisitorParty] = useState<Party | null>(null);

  // FIXME
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const start = async (battleTitle: any) => {
    const messages: string[] = [];

    const { title } = battleTitle;
    if (!title) {
      messages.push('titleを入力してください');
    }
    if (!homeParty) {
      messages.push('home partyを入力してください');
    }
    if (!visitorParty) {
      messages.push('visitor partyを入力してください');
    }

    if (messages.length > 0) {
      setMessage(messages.join('\n'));
      return;
    }

    const battle = await startBattle(battleRepository)(title as string, homeParty as Party, visitorParty as Party, new Date());
    transit(`/battle/?title=${battle.title}`);
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
              id="title"
              error={!!errors.title}
              label="Battle Title"
              placeholder="Title"
              variant="outlined"
              {...register('title')}
              helperText={errors.title && errors.title.message}
              sx={{ width: '100%' }}
            />
          </Box>
          <Box sx={{ p: 1 }}>
            <ImportParty type='HOME' party={homeParty} setParty={setHomeParty}/>
          </Box>
          <Box sx={{ p: 1 }}>
            <ImportParty type='VISITOR' party={visitorParty} setParty={setVisitorParty}/>
          </Box>
          <Box sx={{ p: 1 }}>
            <Button variant="contained" type="submit">Start Battle</Button>
          </Box>
        </Stack>
      </form>
    </Container>
  );
};
