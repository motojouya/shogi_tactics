import type { FC } from 'react';
import type { Battle } from '../model/battle';
import type { Unit } from '../model/unit';

import {
  Chip,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';

import { GameFirst, GameSecond, GameDraw } from '../model/battle';
import { useIO } from './context';
import { ActionTable } from './action_table';
import { sideLabel, statusName } from './label';
import { PieceImage } from './piece_image';

export const GameStatus: FC<{ battle: Battle }> = ({ battle }) => {
  const card = `${battle.first_player_name}(先手) vs ${battle.second_player_name}(後手)`;
  switch (battle.result) {
    case GameFirst: return <Typography>{`${card} 先手の勝利`}</Typography>;
    case GameSecond: return <Typography>{`${card} 後手の勝利`}</Typography>;
    case GameDraw: return <Typography>{`${card} 引き分け`}</Typography>;
    default: return <Typography>{card}</Typography>;
  }
};

export const ActionOrderEntry: FC<{ unit: Unit; order: number }> = ({ unit, order }) => {
  const { piece, status } = useIO();
  const unitPiece = piece.get(unit.piece);
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, width: '100%' }}>
          <Typography sx={{ fontWeight: 'bold' }}>{order + 1}</Typography>
          {unit.leader && <StarIcon fontSize="small" color="warning" />}
          <PieceImage pieceKey={unit.piece} side={unit.side} name={unitPiece?.name} size={28} />
          <Typography>
            {`${sideLabel(unit.side)}: ${unitPiece ? `${unitPiece.name}（${unitPiece.shogiName}）` : unit.piece}`}
          </Typography>
          <Typography variant="body2">{`HP ${unit.hp}`}</Typography>
          <Typography variant="body2">{`コスト ${unit.steps}`}</Typography>
          {unitPiece && <Typography variant="body2">{`移動 ${unitPiece.move}`}</Typography>}
          {unit.statuses.map((statusKey) => (
            <Chip key={statusKey} size="small" variant="outlined" label={statusName(status, statusKey)} />
          ))}
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {unitPiece
          ? <ActionTable actions={unitPiece.actions} />
          : <Typography variant="body2">行動情報がありません</Typography>}
      </AccordionDetails>
    </Accordion>
  );
};
