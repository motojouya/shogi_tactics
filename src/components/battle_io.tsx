import type { FC, ReactNode } from 'react';
import type { BattleRepository } from '../store/battle';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { createRepository as createBattleRepository } from '../store/battle';
import { createDatabase } from '../io/indexed_database';
import { dialogue } from '../io/window_dialogue';
import { IOProvider } from './context';

// new/list/v1の各ページで共通のrepository初期化とIOProvider配線をまとめる。
export const BattleIO: FC<{ children: ReactNode }> = ({ children }) => {
  const [repositories, setRepositories] = useState<{ battleRepository: BattleRepository } | null>(null);
  useEffect(() => {
    (async () => {
      const indexedDatabase = await createDatabase();
      const battleRepository = await createBattleRepository(indexedDatabase);
      setRepositories({ battleRepository });
    })();
  }, []);

  if (!repositories) {
    return (<Box><Typography>loading...</Typography></Box>);
  }

  const io = {
    ...repositories,
    dialogue,
  };

  return (<IOProvider io={io}>{children}</IOProvider>);
};
