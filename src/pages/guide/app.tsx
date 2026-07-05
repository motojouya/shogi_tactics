import type { FC } from 'react';
import { NotFound } from '../../components/utility';
import { MarkdownPage } from '../../components/markdown';
import { GuideIndex } from '../../feature/guide';

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

export const App: FC<{ path: string }> = ({ path }) => {
  if (!path) {
    return <GuideIndex />;
  }
  const content = markdownBySlug[path];
  if (content) {
    return <MarkdownPage content={content} />;
  }
  return <NotFound backLink="/guide/" />;
};
