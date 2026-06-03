import type { FC } from 'react';
import type { Party } from '@motojouya/kniw-core/model/party';

import { useState } from 'react';
import {
  Button,
  Box,
} from '@mui/material';

import { PartyEditor } from '../../components/party';
import { importParty } from '../../procedure/party/importJson';
import { useIO } from '../../components/context';
import { CharactorDuplicationError } from '@motojouya/kniw-core/model/party';
import { NotWearableErorr } from '@motojouya/kniw-core/model/acquirement';
import { JsonSchemaUnmatchError, DataNotFoundError } from '@motojouya/kniw-core/store_utility/schema';
import { UserCancel, EmptyParameter } from '../../io/window_dialogue';

export const PartyNew: FC = () => {

  const { partyRepository, dialogue } = useIO();
  const [party, setParty] = useState<Party>({ name: '', charactors: [] });

  const importJson = async () => {
    const partyObj = await importParty(dialogue, partyRepository)('取り込むと入力したデータが削除されますがよいですか？');
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
    <PartyEditor exist={false} party={party} inoutButton={(
      <Box sx={{ px: 1 }}>
        <Button variant="contained" type="button" onClick={importJson} >Import</Button>
      </Box>
    )} />
  );
};
