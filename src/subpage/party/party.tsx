import type { FC } from 'react';

import {
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { PartyEditor } from '../../components/party';
import { CharactorDuplicationError } from '../../model/party';
import { useIO } from '../../components/context';
import { JsonSchemaUnmatchError, DataNotFoundError } from '../../store_utility/schema';
import { Container } from '../../components/utility';

export const PartyExsiting: FC<{ partyName: string }> = ({ partyName }) => {
  const { partyRepository } = useIO();
  const party = useLiveQuery(() => partyRepository.get(partyName), [partyName]);

  if (
    party instanceof DataNotFoundError ||
    party instanceof CharactorDuplicationError ||
    party instanceof JsonSchemaUnmatchError
  ) {
    return (
      <Container backLink="/party/">
        <Typography>{party.message}</Typography>
      </Container>
    );
  }

  if (!party) {
    return (
      <Container backLink="/party/">
        <Typography>{`${partyName}というpartyは見つかりません`}</Typography>
      </Container>
    );
  }

  return (
    <PartyEditor exist={true} party={party} inoutButton={(
      <Box sx={{ px: 1 }}>
        <Button variant="contained" type="button" onClick={() => partyRepository.exportJson(party, party.name)} >Export</Button>
      </Box>
    )} />
  );
};
