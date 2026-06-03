import type { FC } from 'react';

import {
  Stack,
  Typography,
  List,
  ListItem,
  Button,
} from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { useIO } from '../../components/context';
import { Container, Link, ButtonLink } from '../../components/utility';

export const BattleList: FC = () => {
  const { battleRepository } = useIO();
  const battleNames = useLiveQuery(() => battleRepository.list(), []);
  return (
    <Container backLink="/">
      <Stack direction="column" sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', p: 3, width: "100%", alignItems: "center" }}>
          <Typography>バトル一覧</Typography>
          <ButtonLink href='/battle/?title=__new'><Typography>新しく作る</Typography></ButtonLink>
        </Stack>
        <List sx={{ width: "100%" }}>
          {battleNames && battleNames.map((battleTitle: string, index: number) => (
            <ListItem key={`battle-${index}`}  sx={{ listStyle: 'none', py: '1', px: '5', }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', width: "100%", alignItems: "center" }}>
                <Link href={`/battle/?title=${battleTitle}`} line><Typography>{battleTitle}</Typography></Link>
                <Button variant="outlined" type="button" onClick={() => console.log('Not Deleted! TODO!')}><Typography>Delete</Typography></Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Container>
  );
};
