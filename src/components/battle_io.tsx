import type { FC, ReactNode } from 'react';
import type { Repository } from '../repository';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { createRepository } from '../repository';
import { IOProvider } from './context';

// new/list/v1の各ページで共通のrepository初期化とIOProvider配線をまとめる。
// 全repositoryをcreateRepositoryで束ねて生成し、そのままcontextに載せる。
export const BattleIO: FC<{ children: ReactNode }> = ({ children }) => {
  const [repository, setRepository] = useState<Repository | null>(null);
  useEffect(() => {
    (async () => {
      setRepository(await createRepository());
    })();
  }, []);

  if (!repository) {
    return (<Box><Typography>loading...</Typography></Box>);
  }

  return (<IOProvider io={repository}>{children}</IOProvider>);
};
