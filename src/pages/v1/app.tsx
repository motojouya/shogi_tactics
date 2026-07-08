import type { FC } from 'react';

import { Typography } from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { BattleIO } from '../../components/battle_io';
import { BattleAction } from '../../feature/action';
import { BattleFormation } from '../../feature/formation';
import { BattleCreation } from '../../feature/creation';
import { JsonSchemaUnmatchError } from '../../model/error';
import { isFormation } from '../../model/battle';
import { useIO } from '../../components/context';
import { Container } from '../../components/utility';

export const VERSION = 'v1';

const BattleRoot: FC<{ version: string }> = ({ version }) => {
  const { local, battle: battleRepository } = useIO();
  const key = local.getSearchParams().get('key');
  // フックは無条件に呼ぶ(Rules of Hooks)。keyが無い場合はquerierでnullを返し、分岐はフックの後で行う。
  const battle = useLiveQuery(() => (key ? battleRepository.get(key) : null), [key]);

  if (!key) {
    return (<BattleCreation version={version} />);
  }

  // useLiveQueryはクエリ解決前にundefinedを返すため、not found(null)と区別する
  if (battle === undefined) {
    return (
      <Container backLink="/list/">
        <Typography>loading...</Typography>
      </Container>
    );
  }

  if (battle instanceof JsonSchemaUnmatchError) {
    return (
      <Container backLink="/list/">
        <Typography>{battle.message}</Typography>
      </Container>
    );
  }

  if (battle === null) {
    return (
      <Container backLink="/list/">
        <Typography>{`${key}という対戦は見つかりません`}</Typography>
      </Container>
    );
  }

  if (battle.version !== version) {
    return (
      <Container backLink="/list/">
        <Typography>{`この対戦はversion ${battle.version} のため、${version} の画面では表示できません`}</Typography>
      </Container>
    );
  }

  if (isFormation(battle)) {
    return (<BattleFormation battle={battle} />);
  }

  return (<BattleAction battle={battle} />);
};

export const App: FC = () => (
  <BattleIO>
    <BattleRoot version={VERSION} />
  </BattleIO>
);
