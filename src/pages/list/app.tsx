import type { FC } from 'react';
import type { Battle } from '../../model/battle';

import {
  Stack,
  Typography,
  List,
  ListItem,
  Button,
} from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { isFormation } from '../../model/battle';
import { listBattles } from '../../controller/list';
import { removeBattle } from '../../controller/remove';
import { BattleIO } from '../../components/battle_io';
import { useIO } from '../../components/context';
import { Container, Link, ButtonLink } from '../../components/utility';

const resultLabel = (battle: Battle): string => {
  switch (battle.result) {
    case 'FIRST':
      return `${battle.first_player_name} の勝利`;
    case 'SECOND':
      return `${battle.second_player_name} の勝利`;
    case 'DRAW':
      return '引き分け';
    default:
      return isFormation(battle) ? '編成中' : '対戦中';
  }
};

const BattleList: FC = () => {
  const io = useIO();
  const onDelete = (key: string) => removeBattle(io)(key);
  const battles = useLiveQuery(listBattles(io), []);

  return (
    <Container backLink="/">
      <Stack direction="column" sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', p: 3, width: "100%", alignItems: "center" }}>
          <Typography>バトル一覧</Typography>
          <ButtonLink href='/v1/'><Typography>新しく作る</Typography></ButtonLink>
        </Stack>
        <List sx={{ width: "100%" }}>
          {battles && battles.map((battle: Battle, index: number) => (
            <ListItem key={`battle-${index}`}  sx={{ listStyle: 'none', py: '1', px: '5', }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', width: "100%", alignItems: "center" }}>
                <Link href={`/v1/?key=${battle.key}`} line>
                  <Stack direction="column">
                    <Typography>{`${battle.first_player_name} vs ${battle.second_player_name}`}</Typography>
                    <Typography variant="caption">
                      {`${battle.turns[0] ? new Date(battle.turns[0].datetime).toLocaleString() : ''} / ${resultLabel(battle)}`}
                    </Typography>
                  </Stack>
                </Link>
                <Button variant="outlined" type="button" onClick={() => onDelete(battle.key)}><Typography>削除</Typography></Button>
              </Stack>
            </ListItem>
          ))}
        </List>
      </Stack>
    </Container>
  );
};

export const App: FC = () => (
  <BattleIO>
    <BattleList />
  </BattleIO>
);
