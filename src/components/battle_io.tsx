import type { FC, ReactNode } from 'react';
import type { Repository } from '../repository';

import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

import { createRepository } from '../repository';
import { IOProvider } from './context';

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
