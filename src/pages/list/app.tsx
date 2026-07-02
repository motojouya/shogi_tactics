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

import { BattleIO } from '../../components/battle_io';
import { useIO } from '../../components/context';
import { Container, Link, ButtonLink } from '../../components/utility';

type BattleSummary = { key: string; battle: Battle };

const resultLabel = (battle: Battle): string => {
  switch (battle.result) {
    case 'FIRST':
      return `${battle.first_player_name} の勝利`;
    case 'SECOND':
      return `${battle.second_player_name} の勝利`;
    case 'DRAW':
      return '引き分け';
    default:
      return battle.turns.length === 0 ? '編成中' : '対戦中';
  }
};

const BattleList: FC = () => {
  const { battle: battleRepository, local } = useIO();

  const onDelete = async (key: string) => {
    if (!local.confirm('このバトルを削除しますか？')) {
      return;
    }
    await battleRepository.remove(key);
  };

  const battles = useLiveQuery(async () => {
    const keys = await battleRepository.list();
    const loaded = await Promise.all(keys.map((key) => battleRepository.get(key)));
    const summaries: BattleSummary[] = [];
    keys.forEach((key, index) => {
      const battle = loaded[index];
      // 取得失敗(error/null)は一覧から除外する
      if (battle && typeof battle === 'object' && 'turns' in battle) {
        summaries.push({ key, battle: battle as Battle });
      }
    });
    return summaries;
  }, []);

  return (
    <Container backLink="/">
      <Stack direction="column" sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', p: 3, width: "100%", alignItems: "center" }}>
          <Typography>バトル一覧</Typography>
          <ButtonLink href='/v1/'><Typography>新しく作る</Typography></ButtonLink>
        </Stack>
        <List sx={{ width: "100%" }}>
          {battles && battles.map(({ key, battle }: BattleSummary, index: number) => (
            <ListItem key={`battle-${index}`}  sx={{ listStyle: 'none', py: '1', px: '5', }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between', width: "100%", alignItems: "center" }}>
                <Link href={`/v1/?key=${key}`} line>
                  <Stack direction="column">
                    <Typography>{`${battle.first_player_name} vs ${battle.second_player_name}`}</Typography>
                    <Typography variant="caption">
                      {`${battle.turns[0] ? new Date(battle.turns[0].datetime).toLocaleString() : ''} / ${resultLabel(battle)}`}
                    </Typography>
                  </Stack>
                </Link>
                <Button variant="outlined" type="button" onClick={() => onDelete(key)}><Typography>削除</Typography></Button>
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
