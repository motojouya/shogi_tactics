import type { FC } from 'react';
import {
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
import { Container } from '../../../components/utility';
import { pieceRepository } from '../../../repository/piece';

// 駒と、各駒が持つ行動(action)の一覧。data/pieceの静的データを直接参照する(BattleIO非依存)。
export const App: FC = () => (
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
