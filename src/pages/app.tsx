import type { FC } from 'react';
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { Container, Link, ButtonLink } from '../components/utility';

export const App: FC = () => (
  <Container backLink={null}>
    <Stack sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
      <Typography sx={{ p: 1 }}>将棋タクティクスはタクティクスオウガを参考にしたボードゲームです。</Typography>
      <Typography sx={{ p: 1 }}>初めての方は<Link href="/guide/tutorial/" line>遊び方</Link>を参照してください。</Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-around', p: 1, width: '100%', flexWrap: 'wrap', rowGap: 1 }}>
        <Box>
          <ButtonLink href="/v1/"><Typography>対戦を作る</Typography></ButtonLink>
        </Box>
        <Box>
          <ButtonLink href="/list/"><Typography>バトルの管理</Typography></ButtonLink>
        </Box>
        <Box>
          <ButtonLink href="/guide/"><Typography>遊び方</Typography></ButtonLink>
        </Box>
      </Stack>
    </Stack>
  </Container>
);
