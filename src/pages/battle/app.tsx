import type { FC } from 'react';
import type { PartyRepository } from '../../store/party';
import type { BattleRepository } from '../../store/battle';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { createRepository as createBattleRepository } from '../../store/battle';
import { createRepository as createPartyRepository } from '../../store/party';
import { createDatabase } from '../../io/indexed_database';
import { dialogue } from '../../io/window_dialogue';
import { BattleList } from '../../subpage/battle/list';
import { BattleNew } from '../../subpage/battle/new';
import { BattleExsiting } from '../../subpage/battle/battle';
import { IOProvider } from '../../components/context';
import { getSearchParams } from '../../components/utility';

export const App: FC = () => {
  const searchParams = getSearchParams();
  const key = searchParams.get('key');

  const [repositories, setRepositories] = useState<{ partyRepository: PartyRepository, battleRepository: BattleRepository } | null>(null);
  useEffect(() => {
    (async () => {
      const indexedDatabase = await createDatabase();
      const partyRepository = await createPartyRepository(indexedDatabase);
      const battleRepository = await createBattleRepository(indexedDatabase);
      setRepositories({ partyRepository, battleRepository });
    })();
  }, []);


  if (!repositories) {
    return (<Box><Typography>loading...</Typography></Box>);
  }

  const io = {
    ...repositories,
    dialogue,
  };

  if (!key) {
    return (<IOProvider io={io}><BattleList/></IOProvider>);
  }

  if (key === '__new') {
    return (<IOProvider io={io}><BattleNew/></IOProvider>);
  }

  return (
    <IOProvider io={io}>
      <BattleExsiting battleKey={key}/>
    </IOProvider>
  );
};
