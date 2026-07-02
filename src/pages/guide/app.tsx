import type { FC } from 'react';
import { Box, Stack, Typography, Link as MaterialLink } from '@mui/material';
import { Container, Link } from '../../components/utility';
import { MarkdownPage } from '../../components/markdown';

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

const guideEntries: { slug: string; label: string }[] = [
  { slug: 'tutorial', label: 'はじめに' },
  { slug: 'turbulent', label: '戦乱モード' },
  { slug: 'piece', label: '駒の一覧' },
  { slug: 'offscreen', label: 'アプリなしでの遊び方' },
  { slug: 'rule', label: 'ルール' },
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
