import type { FC } from 'react';
import type { PartyRepository } from '@motojouya/kniw-core/store/party';
import type { BattleRepository } from '@motojouya/kniw-core/store/battle';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
} from '@mui/material';

import { createRepository as createPartyRepository } from '@motojouya/kniw-core/store/party';
import { createRepository as createBattleRepository } from '@motojouya/kniw-core/store/battle';
import { createDatabase } from '../../io/indexed_database';
import { dialogue } from '../../io/window_dialogue';
import { PartyList } from '../../subpage/party/list';
import { PartyNew } from '../../subpage/party/new';
import { PartyExsiting } from '../../subpage/party/party';
import { IOProvider } from '../../components/context';
import { getSearchParams } from '../../components/utility';

export const App: FC = () => {
  const searchParams = getSearchParams();
  const name = searchParams.get('name');

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

  if (!name) {
    return (<IOProvider io={io}><PartyList/></IOProvider>);
  }

  if (name === '__new') {
    return (<IOProvider io={io}><PartyNew/></IOProvider>);
  }

  return (
    <IOProvider io={io}>
      <PartyExsiting partyName={name}/>
    </IOProvider>
  );
};
