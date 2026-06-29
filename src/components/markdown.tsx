import type { FC } from 'react';
import { Box, Typography, Link as MaterialLink } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Container } from './utility';
import { GuideDiagram } from './guide_diagram';

// markdownの各要素をMUIのTypography/Linkへマップし、アプリのデザインに揃える。
// 本文先頭の `# 見出し` がページ見出しを兼ねる(各ページの<title>はhtml側で静的に設定済み)。
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
  // `![alt](diagram:KEY)` は解説図(GuideDiagram)へ、それ以外は通常の画像として表示する。
  img: ({ src, alt }) => {
    const url = typeof src === 'string' ? src : '';
    if (url.startsWith('diagram:')) {
      return <GuideDiagram name={url.slice('diagram:'.length)} alt={alt} />;
    }
    return <Box component="img" src={url} alt={alt} sx={{ maxWidth: '100%', height: 'auto' }} />;
  },
};

export const MarkdownPage: FC<{ content: string }> = ({ content }) => (
  <Container backLink="/guide/">
    <Box sx={{ p: 1 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
        urlTransform={(value) => value}
      >
        {content}
      </ReactMarkdown>
    </Box>
  </Container>
);
