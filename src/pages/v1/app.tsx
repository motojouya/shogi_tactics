import type { FC } from 'react';

import { Typography } from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { BattleIO } from '../../components/battle_io';
import { BattleAction } from '../../feature/action';
import { BattleFormation } from '../../feature/formation';
import { BattleCreation } from '../../feature/creation';
import { JsonSchemaUnmatchError } from '../../repository/error';
import { useIO } from '../../components/context';
import { Container } from '../../components/utility';
import { local } from '../../repository/local';

export const VERSION = 'v1';

const BattleExsiting: FC<{ battleKey: string; version: string }> = ({ battleKey, version }) => {
  const { battle: battleRepository } = useIO();
  const battle = useLiveQuery(() => battleRepository.get(battleKey), [battleKey]);

  if (battle instanceof JsonSchemaUnmatchError) {
    return (
      <Container backLink="/list/">
        <Typography>{battle.message}</Typography>
      </Container>
    );
  }

  if (!battle) {
    return (
      <Container backLink="/list/">
        <Typography>{`${battleKey}というbattleは見つかりません`}</Typography>
      </Container>
    );
  }

  if (battle.version !== version) {
    return (
      <Container backLink="/list/">
        <Typography>{`このbattleはversion ${battle.version} のため、${version} の画面では表示できません`}</Typography>
      </Container>
    );
  }

  if (battle.turns.length === 0) {
    return (<BattleFormation battle={battle} />);
  }

  return (<BattleAction battle={battle} />);
};

export const App: FC = () => {
  const searchParams = local.getSearchParams();
  const key = searchParams.get('key');

  return (
    <BattleIO>
      {key ? <BattleExsiting battleKey={key} version={VERSION} /> : <BattleCreation version={VERSION} />}
    </BattleIO>
  );
};
