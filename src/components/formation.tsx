import type { FC } from 'react';
import type { Battle } from '../model/battle';
import type { Unit, Side } from '../model/unit';

import { useState } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { pieceRepository } from '../store/piece';
import { startBattle } from '../procedure/battle/start';
import { useIO } from './context';
import { Container } from './utility';

const sideLabel = (side: Side): string => (side === 'FIRST' ? '先手' : '後手');

// step6: 編成段階(battle.turns.length===0)のUI。
// 先手→後手の交互に1unitずつ選び、双方がunitCountに達したら戦闘を開始できる。
export const BattleFormation: FC<{ battle: Battle }> = ({ battle }) => {

  const { battleRepository, dialogue } = useIO();
  const pieces = pieceRepository.all;

  const [units, setUnits] = useState<Unit[]>([]);
  const [selected, setSelected] = useState<string>(pieces[0] ? pieces[0].key : '');

  const unitCount = battle.unitCount;
  const firstCount = units.filter((unit) => unit.side === 'FIRST').length;
  const secondCount = units.filter((unit) => unit.side === 'SECOND').length;

  // 先手が先。先手と後手の数が揃っていれば次は先手、先手が1多ければ次は後手。
  // 双方がunitCountに達したらnull(=選択完了)。
  const currentSide: Side | null =
    firstCount === secondCount
      ? (firstCount < unitCount ? 'FIRST' : null)
      : (secondCount < unitCount ? 'SECOND' : null);
  const done = firstCount === unitCount && secondCount === unitCount;

  const playerName = (side: Side): string =>
    side === 'FIRST' ? battle.first_player_name : battle.second_player_name;

  const addUnit = () => {
    if (!currentSide) {
      return;
    }
    const piece = pieceRepository.get(selected);
    if (!piece) {
      return;
    }
    setUnits([...units, { side: currentSide, piece: piece.key, hp: piece.MaxHP, steps: 0, statuses: [] }]);
  };

  const undo = () => setUnits(units.slice(0, -1));

  const startGame = async () => {
    // 先頭Turnを積んで保存。useLiveQueryがturns更新を検知し戦闘画面へ切り替わる。
    await startBattle(battleRepository, dialogue)(battle, units);
  };

  return (
    <Container backLink="/battle/">
      <Stack sx={{ p: 1 }}>
        <Typography>{`${battle.first_player_name}(先手) vs ${battle.second_player_name}(後手) の編成`}</Typography>
        <Typography>{`先手 ${firstCount}/${unitCount} 後手 ${secondCount}/${unitCount}`}</Typography>

        {!done && currentSide && (
          <Stack direction="column" sx={{ pt: 2 }}>
            <Typography>{`次は ${sideLabel(currentSide)}(${playerName(currentSide)}) の番です`}</Typography>
            <Stack direction="row" sx={{ alignItems: 'center', pt: 1 }}>
              <TextField
                select
                size="small"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                sx={{ minWidth: 160 }}
              >
                {pieces.map((piece) => (
                  <MenuItem key={piece.key} value={piece.key}>{piece.name}</MenuItem>
                ))}
              </TextField>
              <Box sx={{ pl: 1 }}>
                <Button variant="contained" type="button" onClick={addUnit}>この駒を追加</Button>
              </Box>
            </Stack>
          </Stack>
        )}

        <Stack direction="column" sx={{ pt: 2 }}>
          {units.map((unit, index) => {
            const piece = pieceRepository.get(unit.piece);
            return (
              <Stack
                key={`formation-unit-${index}`}
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}
              >
                <Typography>{`${sideLabel(unit.side)}: ${piece ? piece.name : unit.piece}`}</Typography>
                {index === units.length - 1 && (
                  <Button variant="outlined" type="button" onClick={undo}>取消</Button>
                )}
              </Stack>
            );
          })}
        </Stack>

        {done && (
          <Box sx={{ pt: 2 }}>
            <Button variant="contained" type="button" onClick={startGame}>Start Battle</Button>
          </Box>
        )}
      </Stack>
    </Container>
  );
};
