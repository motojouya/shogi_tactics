import type { FC } from 'react';

import { Typography } from '@mui/material';

import { BattleIO } from '../../components/battle_io';
import { BattleExsiting } from '../../feature/battle/battle';
import { Container } from '../../components/utility';
import { getSearchParams } from '../../components/utility';

// /v1 : version1のbattleを表示する。?key=<uuid>で対象を指定。version不一致は表示しない。
export const VERSION = 'v1';

export const App: FC = () => {
  const searchParams = getSearchParams();
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
