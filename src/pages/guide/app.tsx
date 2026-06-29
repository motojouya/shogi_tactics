import type { FC } from 'react';
import { Box, Stack, Typography, Link as MaterialLink } from '@mui/material';
import { Container, Link } from '../../components/utility';
import { MarkdownPage } from '../../components/markdown';

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
          <Link href={`/guide/${entry.slug}/`} line>
            <Typography>{entry.label}</Typography>
          </Link>
        </Box>
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        本サイトで使用している駒・将棋盤の画像は{' '}
        <MaterialLink
          href="https://sunfish-shogi.github.io/shogi-images/"
          target="_blank"
          rel="noreferrer"
          color="inherit"
          underline="always"
        >
          sunfish-shogi/shogi-images
        </MaterialLink>{' '}
        から取得しています。
      </Typography>
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
  const content = markdownBySlug[slug];
  if (content) {
    return <MarkdownPage content={content} />;
  }
  return <NotFound />;
};
