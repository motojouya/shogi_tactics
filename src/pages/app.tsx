import type { FC } from 'react';
import {
  Box,
  Stack,
  Typography,
} from '@mui/material';
import { Container, Link } from '../components/utility';

export const App: FC = () => (
  <Container backLink={null}>
    <Stack sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
      <Typography sx={{ p: 1 }}>将棋タクティクスはタクティクスオウガを参考にしたボードゲームです。</Typography>
      <Typography sx={{ p: 1 }}>遊び方やルールは<Link href="/guide/" line>遊び方のページ</Link>を参照してください。</Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-around', p: 1, width: '100%' }}>
        <Box>
          <Link href="/guide/" line>
            <Typography>遊び方</Typography>
          </Link>
        </Box>
        <Box>
          <Link href="/list/" line>
            <Typography>バトルの管理</Typography>
          </Link>
        </Box>
      </Stack>
    </Stack>
  </Container>
);
