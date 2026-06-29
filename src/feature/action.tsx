import type { FC } from 'react';
import type { Battle } from '../model/battle';
import type { Unit, UnitReference } from '../model/unit';
import type { Turn } from '../model/turn';
import type { Action } from '../model/action';
import type { DoActionForm } from '../form/action';
import type { Repository } from '../repository';
import type { SelectChangeEvent } from '@mui/material';

import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  useFieldArray,
  type FieldError,
  type FieldErrors,
  Controller,
  type Control,
  type Merge,
  type FieldErrorsImpl,
} from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Button,
  Box,
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';

import {
  GameOngoing,
  GameFirst,
  GameSecond,
  GameDraw,
  nextActor,
  sortedUnits,
  getLastTurn,
} from '../model/battle';
import { toUnitReference } from '../model/unit';
import {
  doActionFormSchema,
  receiverSelectOption,
} from '../form/action';
import { ORDER_DO_NOTHING } from '../model/turn';
import { ReceiverDuplicationError } from '../model/action';
import { DataNotFoundError } from '../repository/error';
import { act } from '../controller/act';
import { surrender } from '../controller/surrender';
import { simulate } from '../model/simulation';
import { UserCancel } from '../repository/error';
import { useIO } from '../components/context';
import { createResolvers } from '../repository';
import { Container } from '../components/utility';
import { ActionTable } from '../components/action_table';
import { sideLabel } from '../components/label';

// step8: battleはkeyしか持たないので、presentationでstore参照してpiece/statusを解決する。
const pieceName = (pieceRepository: Repository['piece'], pieceKey: string): string => {
  const piece = pieceRepository.get(pieceKey);
  return piece ? piece.name : pieceKey;
};
const statusName = (statusRepository: Repository['status'], statusKey: string): string => {
  const status = statusRepository.get(statusKey);
  return status ? status.name : statusKey;
};

// 技+対象を選んだ際のプレビュー。hpの変化と、対象が除外(hp0)になるかだけを示す。
type ReceiverPreview = { pieceKey: string; before: number; after: number; excluded: boolean };

const GameStatus: FC<{ battle: Battle }> = ({ battle }) => {
  const card = `${battle.first_player_name}(先手) vs ${battle.second_player_name}(後手)`;
  switch (battle.result) {
    case GameFirst: return <Typography>{`${card} 先手の勝利`}</Typography>;
    case GameSecond: return <Typography>{`${card} 後手の勝利`}</Typography>;
    case GameDraw: return <Typography>{`${card} 引き分け`}</Typography>;
    // turn番号は巻き戻し時に混乱を招くため表示しない(レビュー指摘)。
    default: return <Typography>{card}</Typography>;
  }
};

// 行動順の1エントリ。1行サマリ(順番号/リーダ/駒名/HP/コスト/移動/状態)と、
// アコーディオン内に駒の行動表(ActionTable)を表示する。
const ActionOrderEntry: FC<{ unit: Unit; order: number }> = ({ unit, order }) => {
  const { piece, status } = useIO();
  const unitPiece = piece.get(unit.piece);
  return (
    <Accordion disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 1, width: '100%' }}>
          <Typography sx={{ fontWeight: 'bold' }}>{order + 1}</Typography>
          {unit.leader && <StarIcon fontSize="small" color="warning" />}
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

type GetReceiverError = (errors: FieldErrors, i: number, property: string) => FieldError | undefined;
const getReceiverError: GetReceiverError = (errors, i, property) => {
  const errorsReceivers = errors.receivers;
  if (!errorsReceivers) {
    return errorsReceivers;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorsReceiverIndexed = (errorsReceivers as Merge<FieldError, FieldErrorsImpl<any>>)[i];
  if (!errorsReceiverIndexed) {
    return errorsReceiverIndexed;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (errorsReceiverIndexed as Merge<FieldError, FieldErrorsImpl<any>>)[property];
  if (!error) {
    return error;
  }

  return error as FieldError;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HookOnChange = (e: any) => void;

const ReceiverSelect: FC<{
  action: Action,
  actor: UnitReference,
  lastTurn: Turn,
  index: number,
  errors: FieldErrors<DoActionForm>,
  control: Control<DoActionForm>,
  addReceiver: () => void,
}> = ({ action, actor, lastTurn, index, errors, control, addReceiver }) => {

  const { piece } = useIO();

  const formItemName = `receivers.${index}.value` as const;
  const error = getReceiverError(errors, index, 'value');

  const onChange = (hookOnChange: HookOnChange) => (e: SelectChangeEvent<string>) => {
    hookOnChange(e);
    addReceiver();
  };

  const receiverOptions = action.filter(actor, lastTurn.units).map(receiverSelectOption(piece));

  return (
    <Controller
      name={formItemName}
      control={control}
      render={({ field }) => (
        <FormControl error={!!error}>
          <InputLabel id={`receiver_label_${index}`}>receiver</InputLabel>
          <Select
            id={`receiver_select_${index}`}
            labelId={`receiver_label_${index}`}
            label='receiver'
            {...field}
            value={field.value ?? ''}
            onChange={onChange(field.onChange)}
          >
            {receiverOptions.map(receiverOption => (
              <MenuItem key={`${receiverOption.value}`} value={receiverOption.value}>
                {receiverOption.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{!!error && error.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};

const SurrenderButton: FC<{ battle: Battle, actor: UnitReference }> = ({ battle, actor }) => {
  const io = useIO();
  const doSurrender = () => surrender(io)(battle, actor, new Date());
  return <Button variant='outlined' type="button" onClick={doSurrender}>降参</Button>;
};

const ActionSelect: FC<{
  actions: Action[],
  onSelect: (action: Action | null) => void,
  errors: FieldErrors<DoActionForm>,
  control: Control<DoActionForm>,
}> = ({ actions, onSelect, errors, control }) => {

  // 技選択肢にコストを含める(レビュー指摘: コストは選択肢内で見せたい)。
  const actionOptions = actions.map(action => ({ value: action.key, label: `${action.name}（コスト${action.cost}）` }));
  actionOptions.push({ value: ORDER_DO_NOTHING, label: '何もしない' });

  const onChange = (hookOnChange: HookOnChange) => (e: SelectChangeEvent<string>) => {
    const actionKey = e.target.value;
    onSelect(actions.find(action => action.key === actionKey) ?? null);
    hookOnChange(e);
  };

  return (
    <Controller
      name='actionKey'
      control={control}
      render={({ field }) => (
        <FormControl error={!!errors.actionKey}>
          <InputLabel id="action_label">action</InputLabel>
          <Select
            id='action_select'
            labelId='action_label'
            label='action'
            {...field}
            value={field.value ?? ''}
            onChange={onChange(field.onChange)}
          >
            {actionOptions.map(actionOption => (
              <MenuItem key={`${actionOption.value}`} value={actionOption.value}>
                {actionOption.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{!!errors.actionKey && errors.actionKey.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};

export const BattleAction: FC<{ battle: Battle }> = ({ battle }) => {

  const [lastTurn, setLastTurn] = useState<Turn | null>(() => getLastTurn(battle));

  const reload = useCallback((target: Battle) => {
    setLastTurn(getLastTurn(target));
  }, []);

  return lastTurn
    ? <BattleTurn battle={battle} lastTurn={lastTurn} reload={reload} />
    : <Box>loading</Box>;
};

export const BattleTurn: FC<{
  battle: Battle,
  lastTurn: Turn,
  reload: (battle: Battle) => void,
}> = ({ battle, lastTurn, reload }) => {

  const io = useIO();
  const { battle: battleRepository, piece } = io;
  const resolvers = createResolvers(io);

  const {
    handleSubmit,
    getValues,
    formState: { errors }, //, isSubmitting
    reset,
    control,
  } = useForm<DoActionForm>({ resolver: zodResolver(doActionFormSchema) });

  const { fields, replace } = useFieldArray({ control, name: 'receivers' });
  const [message, setMessage] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [simulated, setSimulated] = useState<(ReceiverPreview | null)[]>([]);

  const actorUnit = nextActor(lastTurn);
  const actor = actorUnit ? toUnitReference(actorUnit) : null;
  const actorPiece = actorUnit ? piece.get(actorUnit.piece) : null;
  const actorActions = actorPiece ? actorPiece.actions : [];

  const onSelectAction = (action: Action | null) => {
    setSelectedAction(action);
    setSimulated([]);
    if (action) {
      replace(Array(action.receiverCount).fill({ value: '' }));
    } else {
      replace([]);
    }
  };

  const doAct = async (form: DoActionForm) => {
    if (!actor) {
      setMessage('actor not found');
      return;
    }

    const result = await act(io)(battle, actor, form);

    if (result instanceof DataNotFoundError) {
      setMessage('入力してください');
      return;
    }
    if (result instanceof ReceiverDuplicationError) {
      setMessage(result.message);
      return;
    }
    if (result instanceof UserCancel) {
      setMessage(result.message);
      return;
    }

    setMessage('');
    setSelectedAction(null);
    setSimulated([]);
    replace([]);
    reset();
    reload(result);
  };

  const addReceiver = (index: number) => () => {
    if (!actor || !selectedAction) {
      return;
    }
    const value = getValues(`receivers.${index}.value` as const);
    if (!value) {
      return;
    }
    const index2 = value.indexOf(':');
    const receiver: UnitReference = { side: value.slice(0, index2) as 'FIRST' | 'SECOND', piece: value.slice(index2 + 1) };
    const before = lastTurn.units.find((unit) => unit.side === receiver.side && unit.piece === receiver.piece)?.hp ?? 0;
    const { survive, unit } = simulate(selectedAction, actor, receiver, lastTurn, resolvers);

    const newSimulated = [...simulated];
    while (newSimulated.length <= index) {
      newSimulated.push(null);
    }
    newSimulated[index] = unit
      ? { pieceKey: receiver.piece, before, after: unit.hp, excluded: !survive }
      : null;
    setSimulated(newSimulated);
  };

  return (
    <Container backLink="/list/">
      <Stack>
        <Stack sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", width: '100%', pb: 1 }}>
            <Stack sx={{ flex: "0 0 70px", justifyContent: "center" }}><Typography>Battle!</Typography></Stack>
            <Box sx={{ flex: "1 1 auto" }}>
              {battle.result !== GameOngoing && (
                <Button type="button" variant='outlined' onClick={() => battleRepository.exportJson(battle, '')}>Export</Button>
              )}
            </Box>
          </Stack>
          <Box>
            <GameStatus battle={battle} />
          </Box>
        </Stack>
        {battle.result === GameOngoing && actor && actorUnit && (
          <Stack sx={{ borderTop: '1px solid royalblue' }}>
            <form onSubmit={handleSubmit(doAct)}>
              {message && (<Typography>{message}</Typography>)}
              <Box sx={{ py: 1 }}>
                <Typography sx={{ display: "inline-block", pr: 1 }}>
                  {`${actorPiece ? `${actorPiece.name}（${actorPiece.shogiName}）` : pieceName(piece, actorUnit.piece)}のターン`}
                </Typography>
                <Chip variant="outlined" color='primary' label={sideLabel(actorUnit.side)} />
              </Box>
              <Stack>
                <ActionSelect
                  actions={actorActions}
                  onSelect={onSelectAction}
                  errors={errors}
                  control={control}
                />
                {selectedAction && (
                  <Typography variant="body2" sx={{ pt: 0.5 }}>{selectedAction.description}</Typography>
                )}
              </Stack>
              <Stack sx={{ justifyContent: "flex-start", p: 1, width: '100%' }}>
                {selectedAction && fields.map((item, index) => {
                  const preview = simulated[index];
                  return (
                    <Stack key={item.id} sx={{ pb: 1 }}>
                      <ReceiverSelect
                        action={selectedAction}
                        actor={actor}
                        lastTurn={lastTurn}
                        index={index}
                        errors={errors}
                        control={control}
                        addReceiver={addReceiver(index)}
                      />
                      {preview && (
                        <Typography variant="body2" sx={{ pl: 1, pt: 0.5 }}>
                          {`${pieceName(piece, preview.pieceKey)}: HP ${preview.before} → ${preview.after}${preview.excluded ? '（除外）' : ''}`}
                        </Typography>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
              <Stack direction='row' sx={{ justifyContent: "flex-end", py: 1 }}>
                <Box sx={{ px: 1 }}>
                  <Button type="submit" variant='outlined' sx={{ px: 1 }}>実行</Button>
                </Box>
                <Box sx={{ px: 1 }}>
                  <SurrenderButton battle={battle} actor={actor} />
                </Box>
              </Stack>
            </form>
            <Box sx={{ borderTop: '1px solid royalblue', py: 1 }}>
              <Box><Typography variant='h5'>Action Orders</Typography></Box>
              <Stack sx={{ justifyContent: "flex-start", p: 1, width: '100%' }}>
                {sortedUnits(lastTurn).map((unit, index) => (
                  <ActionOrderEntry key={`unit-${unit.side}-${unit.piece}-${index}`} unit={unit} order={index} />
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
