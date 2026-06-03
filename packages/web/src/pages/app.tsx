import type { FC } from 'react';
import {
  Box,
  Stack,
  Typography,
  Link as MaterialLink,
} from '@mui/material';
import { Container, Link } from '../components/utility';

export const App: FC = () => (
  <Container backLink={null}>
    <Stack sx={{ justifyContent: 'flex-start', alignItems: "center" }}>
      <Typography sx={{ p: 1 }}>KNIWはタクティクスオウガを参考にしたボードゲームです。</Typography>
      <Typography sx={{ p: 1 }}>遊び方やルールは<MaterialLink href="https://github.com/motojouya/kniw" underline="always">こちらのページ</MaterialLink>を参照してください。</Typography>
      <Stack direction="row" sx={{ justifyContent: 'space-around', p: 1, width: '100%' }}>
        <Box>
          <Link href="/party/" line>
            <Typography>パーティの作成</Typography>
          </Link>
        </Box>
        <Box>
          <Link href="/battle/" line>
            <Typography>バトルの管理</Typography>
          </Link>
        </Box>
      </Stack>
    </Stack>
  </Container>
);
