import type { FC } from 'react';

import {
  Stack,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";
import { useIO } from '../../components/context';
import { Container, Link, ButtonLink } from '../../components/utility';

export const PartyList: FC = () => {
  const { partyRepository } = useIO();
  const partyNames = useLiveQuery(() => partyRepository.list(), []);

  return (
    <Container backLink="/">
      <Stack direction="column" sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', p: 3, width: "100%", alignItems: "center" }}>
          <Typography>パーティ一覧</Typography>
          <ButtonLink href='/party/?name=__new'><Typography>新しく作る</Typography></ButtonLink>
        </Stack>
        <List sx={{ width: "100%" }}>
          {partyNames && partyNames.map((partyName, index) => (
            <ListItem key={`party-${index}`} sx={{ listStyle: 'none', py: '1', px: '5', }}>
              <Link href={`/party/?name=${partyName}`} line><Typography>{partyName}</Typography></Link>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Container>
  );
};
