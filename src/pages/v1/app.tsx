import type { FC } from 'react';

import { Typography } from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { BattleIO } from '../../components/battle_io';
import { BattleAction } from '../../feature/action';
import { BattleFormation } from '../../feature/formation';
import { JsonSchemaUnmatchError } from '../../repository/error';
import { useIO } from '../../components/context';
import { Container } from '../../components/utility';
import { local } from '../../repository/local';

// /v1 : version1のbattleを表示する。?key=<uuid>で対象を指定。version不一致は表示しない。
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

  // 表示ページのversionとbattleのversionが一致しないと表示しない(step10)。
  if (battle.version !== version) {
    return (
      <Container backLink="/list/">
        <Typography>{`このbattleはversion ${battle.version} のため、${version} の画面では表示できません`}</Typography>
      </Container>
    );
  }

  // turns.length===0は編成段階。units選択が終わって先頭Turnが積まれたら戦闘画面へ。
  if (battle.turns.length === 0) {
    return (<BattleFormation battle={battle} />);
  }

  return (<BattleAction battle={battle} />);
};

export const App: FC = () => {
  const searchParams = local.getSearchParams();
  const key = searchParams.get('key');

  if (!key) {
    return (
      <Container backLink="/list/">
        <Typography>表示するbattleが指定されていません</Typography>
      </Container>
    );
  }

  return (
    <BattleIO>
      <BattleExsiting battleKey={key} version={VERSION} />
    </BattleIO>
  );
};
