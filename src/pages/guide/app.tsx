import type { FC } from 'react';
import {
  Box,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import { Container, Link } from '../../components/utility';
import { MarkdownPage } from '../../components/markdown';
import { pieceRepository } from '../../repository/piece';

// guide配下の全markdownを ?raw でstring取得し、slug(ファイル名)->本文 のmapにする。
const markdownModules = import.meta.glob('../../guide/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const markdownBySlug: Record<string, string> = Object.fromEntries(
  Object.entries(markdownModules).map(([path, content]) => {
    const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
    return [slug, content];
  }),
);

// 目次に並べるリンク。slugはmarkdownのファイル名、または素のreact pageの 'piece'。
const guideEntries: { slug: string; label: string }[] = [
  { slug: 'tutorial', label: '遊び方' },
  { slug: 'rule', label: 'ルール' },
  { slug: 'turbulent', label: '戦乱モード' },
  { slug: 'offscreen', label: 'アプリなしでの遊び方' },
  { slug: 'piece', label: '駒と行動の一覧' },
];

const GuideIndex: FC = () => (
  <Container backLink="/">
    <Stack sx={{ justifyContent: 'flex-start', alignItems: 'center', p: 1 }}>
      <Typography variant="h4" sx={{ p: 1 }}>
        遊び方
      </Typography>
      {guideEntries.map((entry) => (
        <Box key={entry.slug} sx={{ p: 1 }}>
          <Link href={`/guide/${entry.slug}`} line>
            <Typography>{entry.label}</Typography>
          </Link>
        </Box>
      ))}
    </Stack>
  </Container>
);

const GuidePiece: FC = () => (
  <Container backLink="/guide/">
    <Stack sx={{ p: 1 }}>
      <Typography variant="h4" sx={{ p: 1 }}>
        駒と行動の一覧
      </Typography>
      {pieceRepository.all.map((piece) => (
        <Card key={piece.key} sx={{ my: 1 }}>
          <CardContent>
            <Typography variant="h5">{piece.name}</Typography>
            <Typography sx={{ my: 1 }}>{piece.description}</Typography>
            <Typography variant="body2">
              最大HP: {piece.MaxHP} / 移動: {piece.move}
            </Typography>
            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>行動</TableCell>
                  <TableCell>説明</TableCell>
                  <TableCell align="right">コスト</TableCell>
                  <TableCell align="right">威力</TableCell>
                  <TableCell align="right">到達</TableCell>
                  <TableCell align="right">影響</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {piece.actions.map((action) => (
                  <TableRow key={action.key}>
                    <TableCell>{action.name}</TableCell>
                    <TableCell>{action.description}</TableCell>
                    <TableCell align="right">{action.cost}</TableCell>
                    <TableCell align="right">{action.baseDamage}</TableCell>
                    <TableCell align="right">{action.reachLength}</TableCell>
                    <TableCell align="right">{action.effectLength}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </Stack>
  </Container>
);

const NotFound: FC = () => (
  <Container backLink="/guide/">
    <Typography sx={{ p: 2 }}>ページが見つかりませんでした。</Typography>
  </Container>
);

// pathnameからguideのslugを取り出して描画対象を決める(VITE_URL_PREFIX付きでも 'guide' 位置で判定)。
export const App: FC = () => {
  const segments = window.location.pathname.split('/').filter(Boolean);
  const guideIndex = segments.indexOf('guide');
  const slug = guideIndex >= 0 ? segments[guideIndex + 1] : undefined;

  if (!slug) {
    return <GuideIndex />;
  }
  if (slug === 'piece') {
    return <GuidePiece />;
  }
  const content = markdownBySlug[slug];
  if (content) {
    return <MarkdownPage content={content} />;
  }
  return <NotFound />;
};
