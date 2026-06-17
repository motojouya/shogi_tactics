import type { FC } from 'react';

import { Typography } from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { BattleContainer } from '../../components/battle';
import { BattleFormation } from '../../components/formation';
import { JsonSchemaUnmatchError } from '../../store_utility/schema';
import { useIO } from '../../components/context';
import { Container } from '../../components/utility';

export const BattleExsiting: FC<{ battleKey: string; version: string }> = ({ battleKey, version }) => {
  const { battleRepository } = useIO();
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

  return (<BattleContainer battle={battle} />);
};
