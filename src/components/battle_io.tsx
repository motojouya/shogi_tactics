import type { FC, ReactNode } from 'react';
import type { BattleRepository } from '../repository/battle';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { createRepository as createBattleRepository } from '../repository/battle';
import { local } from '../repository/local';
import { IOProvider } from './context';

// new/list/v1の各ページで共通のrepository初期化とIOProvider配線をまとめる。
export const BattleIO: FC<{ children: ReactNode }> = ({ children }) => {
  const [repositories, setRepositories] = useState<{ battleRepository: BattleRepository } | null>(null);
  useEffect(() => {
    (async () => {
      const battleRepository = await createBattleRepository();
      setRepositories({ battleRepository });
    })();
  }, []);

  if (!repositories) {
    return (<Box><Typography>loading...</Typography></Box>);
  }

  const io = {
    ...repositories,
    dialogue: local,
  };

  return (<IOProvider io={io}>{children}</IOProvider>);
};
