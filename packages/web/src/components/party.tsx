import type { FC, ReactNode } from 'react';
import type { Party } from '@motojouya/kniw-core/model/party';
import type { PartyForm } from '../form/party';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { CharactorCard } from './charactor';
import { partyFormSchema, toPartyForm } from '../form/party';
import { saveParty } from '../procedure/party/save';
import { dismissParty } from '../procedure/party/dismiss';
import { CharactorDuplicationError } from '@motojouya/kniw-core/model/party';
import { NotWearableErorr } from '@motojouya/kniw-core/model/acquirement';
import { JsonSchemaUnmatchError, DataNotFoundError, DataExistError } from '@motojouya/kniw-core/store_utility/schema';
import { useIO } from './context';
import { importParty } from '../procedure/party/importJson';
import { UserCancel, EmptyParameter } from '../io/window_dialogue';
import { transit } from './utility';
import { Container } from './utility';

// FIXME subpage/party/newにも似たようなものがあるので共通化したいができるかな。こちらはbattleのparty import用
export const ImportParty: FC<{
  type: string,
  party: Party | null,
  setParty: (party: Party | null) => void,
}> = ({ type, party, setParty }) => {

  const { partyRepository, dialogue } = useIO();
  const importJson = async () => {
    const partyObj = await importParty(dialogue, partyRepository)(undefined);
    if (!(
      partyObj instanceof UserCancel ||
      partyObj instanceof EmptyParameter ||
      partyObj instanceof JsonSchemaUnmatchError ||
      partyObj instanceof NotWearableErorr ||
      partyObj instanceof DataNotFoundError ||
      partyObj instanceof CharactorDuplicationError
    )) {
      setParty(partyObj);
    }
  };

  return (
    <Stack direction='row' sx={{ justifyContents: 'flex-start', alignItems: 'center' }}>
      <Box sx={{ pr: 1 }}>
        <Button variant="contained" type="button" onClick={importJson}>{`Select ${type} Party`}</Button>
      </Box>
      {party && (
      <Box>
        <Typography>{party.name}</Typography>
      </Box>
      )}
    </Stack>
  );
};

export const PartyEditor: FC<{
  exist: boolean,
  party: Party,
  inoutButton: ReactNode,
}> = ({ exist, party, inoutButton }) => {

  const { partyRepository, dialogue } = useIO();
  const partyForm = toPartyForm(party);
  const {
    handleSubmit,
    register,
    getValues,
    formState: { errors }, //, isSubmitting
    control,
  } = useForm<PartyForm>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: partyForm,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "charactors" });
  const [saveMessage, setSaveMessage] = useState<{ error: boolean, message: string }>({ error: false, message: '' });

  const save = async (partyInput: PartyForm) => {
    const error = await saveParty(partyRepository, !exist)(partyInput);
    if (
      error instanceof DataNotFoundError ||
      error instanceof NotWearableErorr ||
      error instanceof JsonSchemaUnmatchError ||
      error instanceof CharactorDuplicationError ||
      error instanceof DataExistError
    ) {
      setSaveMessage({
        error: true,
        message: error.message,
      });
    } else {
      if (exist) {
        setSaveMessage({
          error: false,
          message: '保存しました',
        });
      } else {
        transit(`/party/?name=${partyInput.name}`);
      }
    }
  };

  const deleteParty = async (partyName: string) => {
    const result = await dismissParty(dialogue, partyRepository)(partyName);
    if (result) {
      transit('/party/');
    }
  };

  // FIXME Button  loading={isSubmitting} loadingText="Creating Party..." としたかったがloadingがエラーになる
  return (
    <Container backLink="/party/">
      <form onSubmit={handleSubmit(save)}>
        <Stack direction="column" sx={{ justifyContent: "flex-start", alignItems: "center" }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", p: 1, width: '100%' }}>
            <Box sx={{ width: '100px' }}>
              <Typography>Edit the party</Typography>
            </Box>
            <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
              <Box sx={{ px: 1 }}>
                <Button variant="contained" type="submit">{exist ? 'Change' : 'Create'}</Button>
              </Box>
              {exist && (
                <Box sx={{ px: 1 }}>
                  <Button variant="contained" type="button" onClick={() => deleteParty(partyForm.name)}>Dismiss</Button>
                </Box>
              )}
              {inoutButton}
            </Stack>
          </Stack>
          {saveMessage.message && (
            saveMessage.error
              ? <Typography>{saveMessage.message}</Typography>
              : <Typography>{saveMessage.message}</Typography>
          )}
          {exist ? (
            <Stack direction="row" sx={{ p: 1, width: '100%', alignItems: 'center' }}>
              <Box flex="0 0 100px"><Typography>Party Name</Typography></Box>
              <Box><Typography variant="h4">{partyForm.name}</Typography></Box>
            </Stack>
          ) : (
            <Stack direction="row" sx={{ p: 1, width: '100%' }}>
              <TextField
                id="party_name"
                error={!!errors.name}
                label="Party Name"
                placeholder="party name"
                variant="outlined"
                {...register('name')}
                helperText={errors.name && errors.name.message}
                sx={{ width: '100%' }}
              />
            </Stack>
          )}
          <Stack direction="column" sx={{ justifyContent: "flex-start", p: 1, width: '100%' }}>
            <Box sx={{ pb: 1, width: '100%' }}>
              <Button variant="contained" type="button" sx={{ width: '100%' }} onClick={() => append({ name: '', race: '', blessing: '', clothing: '', weapon: '' })}>Hire Charactor</Button>
            </Box>
            {fields.map((item, index) => (
              <CharactorCard key={`party_charactor_${item.id}`} register={register} getValues={getValues} remove={remove} errors={errors} index={index} control={control} />
            ))}
          </Stack>
        </Stack>
      </form>
    </Container>
  );
};
