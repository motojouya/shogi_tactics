import type { FC, ReactNode } from 'react';
import {
  SvgIcon,
  Button,
  Container as MaterialContainer,
  Box,
  Stack,
  Typography,
  Link as MaterialLink,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const urlPrefix = import.meta.env.VITE_URL_PREFIX;

export const Link: FC<{ href: string, line: boolean, children: ReactNode }> = ({ href, line, children }) => {

  let assignPath = href;
  if (urlPrefix) {
    assignPath = "/" + urlPrefix + href;
  }

  let underline: 'none' | 'always' = 'none' as const;
  if (line) {
    underline = "always" as const;
  }

  return (<MaterialLink href={assignPath} underline={underline} sx={{ color: '#000000' }}>{children}</MaterialLink>);
};

export const ButtonLink: FC<{ href: string, children: ReactNode }> = ({ href, children }) => {

  let assignPath = href;
  if (urlPrefix) {
    assignPath = "/" + urlPrefix + href;
  }

  return (<Button variant="contained" href={assignPath}>{children}</Button>);
};

export const Container: FC<{ backLink: string | null; children: ReactNode; }> = ({ backLink, children }) => (
  <MaterialContainer>
    <Box>
      <Header backLink={backLink} />
      {children}
    </Box>
  </MaterialContainer>
);

export const NotFound: FC<{ backLink?: string | null }> = ({ backLink = null }) => (
  <Container backLink={backLink}>
    <Typography sx={{ p: 2 }}>ページが見つかりませんでした。</Typography>
  </Container>
);

export const Header: FC<{ backLink: string | null; }> = ({ backLink }) => {
  return (
    <Stack sx={{ justifyContent: 'flex-start', alignItems: 'center', p: 1 }} direction="row" >
        {backLink && (
          <Box sx={{ p: 1, flexShrink: 0 }}>
            <Link href={backLink} line={false}>
              <SvgIcon>
                <ArrowBackIcon />
              </SvgIcon>
            </Link>
          </Box>
        )}
        <Box sx={{ p: 1, minWidth: 0 }}>
          <Link href="/" line={false}>
            <Typography variant="h3" noWrap sx={{ fontSize: { xs: '1.6rem', sm: '2.4rem', md: '3rem' } }}>将棋タクティクス</Typography>
          </Link>
        </Box>
      </Stack>
  );
};
