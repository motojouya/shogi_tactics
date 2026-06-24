import type { FC } from 'react';
import { useEffect } from 'react';
import { Box, Typography, Link as MaterialLink } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Container } from './utility';

// guideのmarkdownは先頭に `---\ntitle: ...\nslug: ...\n---` のfrontmatterを持つ。
// 必要なのはtitleのみ。剥がさないと `---` がreact-markdownで水平線として描画されるため分離は必須。
const parseFrontmatter = (raw: string): { title: string; body: string } => {
  const matched = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!matched) {
    return { title: '', body: raw };
  }
  const meta = Object.fromEntries(
    matched[1].split('\n').map((line) => {
      const index = line.indexOf(':');
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    }),
  );
  return { title: meta.title ?? '', body: raw.slice(matched[0].length) };
};

// markdownの各要素をMUIのTypography/Linkへマップし、アプリのデザインに揃える。
// 本文先頭の `# 見出し` がページタイトルを兼ねる(frontmatterのtitleはdocument.title専用)。
const markdownComponents: Components = {
  h1: ({ children }) => (
    <Typography variant="h4" sx={{ mt: 3, mb: 1 }}>
      {children}
    </Typography>
  ),
  h2: ({ children }) => (
    <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>
      {children}
    </Typography>
  ),
  h3: ({ children }) => (
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
      {children}
    </Typography>
  ),
  p: ({ children }) => <Typography sx={{ my: 1 }}>{children}</Typography>,
  li: ({ children }) => (
    <Typography component="li" sx={{ my: 0.5 }}>
      {children}
    </Typography>
  ),
  a: ({ href, children }) => {
    const external = !!href && /^https?:\/\//.test(href);
    return (
      <MaterialLink
        href={href}
        underline="always"
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
      >
        {children}
      </MaterialLink>
    );
  },
};

export const MarkdownPage: FC<{ content: string }> = ({ content }) => {
  const { title, body } = parseFrontmatter(content);

  useEffect(() => {
    if (title) {
      document.title = `${title} | 将棋タクティクス`;
    }
  }, [title]);

  return (
    <Container backLink="/guide/">
      <Box sx={{ p: 1 }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {body}
        </ReactMarkdown>
      </Box>
    </Container>
  );
};
