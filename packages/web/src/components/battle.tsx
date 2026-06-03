import type { FC } from 'react';
import type { Battle } from '@motojouya/kniw-core/model/battle';
import type { CharactorBattling } from '@motojouya/kniw-core/model/charactor';
import type { Skill } from '@motojouya/kniw-core/model/skill';
import type { Turn } from '@motojouya/kniw-core/model/turn';
import type { DoSkillForm } from '../form/battle';
import type { SelectChangeEvent } from '@mui/material';

import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  useFieldArray,
  FieldError,
  FieldErrors,
  UseFieldArrayReplace,
  Controller,
  Control,
  Merge,
  FieldErrorsImpl,
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
} from '@mui/material';

import {
  GameOngoing,
  GameHome,
  GameVisitor,
  GameDraw,
  turnActor,
  getLastTurn,
} from '@motojouya/kniw-core/model/battle';
import { createRandoms } from "@motojouya/kniw-core/model/random";
import { CharactorDetail, CharactorStatus } from './charactor';
import {
  doSkillFormSchema,
  toSkill,
  receiverSelectOption,
  ReceiverDuplicationError,
} from '../form/battle';
import { ACTION_DO_NOTHING } from '@motojouya/kniw-core/model/turn';
import { getSkills, isVisitorString } from '@motojouya/kniw-core/model/charactor';
import { skillRepository } from '@motojouya/kniw-core/store/skill';
import { MAGIC_TYPE_NONE } from '@motojouya/kniw-core/model/skill';

import { underStatus } from '@motojouya/kniw-core/model/status';
import { silent } from '@motojouya/kniw-core/store_data/status/index';
import { DataNotFoundError } from '@motojouya/kniw-core/store_utility/schema';
import { act } from '../procedure/battle/act';
import { surrender } from '../procedure/battle/surrender';
import { simulate } from '../procedure/battle/simulate';
import { UserCancel } from '../io/window_dialogue';
import { useIO } from './context';
import { Container } from './utility';

const GameStatus: FC<{ battle: Battle }> = ({ battle }) => {
  const card = `${battle.home.name}(HOME) vs ${battle.visitor.name}(VISITOR)`;
  // FIXME Actionを終えるとbattle.turnsは更新されるので、Turn Noは次の値になってしまう。これはNext Turnボタンを押しても変わらないので違和感があるはず
  switch (battle.result) {
    case GameHome: return <Typography>{`${card} HOMEの勝利`}</Typography>;
    case GameVisitor: return <Typography>{`${card} VISITORの勝利`}</Typography>;
    case GameDraw: return <Typography>{`${card} 引き分け`}</Typography>;
    default: return <Typography>{`${card} Turn No.${battle.turns.length + 1}`}</Typography>;
  }
};

type GetReceiverError = (errors: FieldErrors, i: number, property: string) => FieldError | undefined;
const getReceiverError: GetReceiverError = (errors, i, property) => {
  const errorsReceivers = errors.receiversWithIsVisitor;
  if (!errorsReceivers) {
    return errorsReceivers;
  }
  // FIXME
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorsReceiverIndexed = (errorsReceivers as Merge<FieldError, FieldErrorsImpl<any>>)[i];
  if (!errorsReceiverIndexed) {
    return errorsReceiverIndexed;
  }
  // FIXME
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
  lastTurn: Turn,
  index: number,
  errors: FieldErrors<DoSkillForm>,
  control: Control<DoSkillForm>,
  addReceiver: () => void,
}> = ({ lastTurn, index, errors, control, addReceiver }) => {

  const formItemName = `receiversWithIsVisitor.${index}.value` as const;
  const error = getReceiverError(errors, index, 'value');

  // FIXME useCallback
  const onChange = (hookOnChange: HookOnChange) => (e: SelectChangeEvent<string>) => {
    hookOnChange(e);
    addReceiver();
  };

  const receiverOptions = lastTurn.sortedCharactors.map(receiverSelectOption);

  return (
    <>
      <Controller
        name={formItemName}
        control={control}
        render={({ field }) => (
          <FormControl error={!!error}>
            <InputLabel id="receiver_label">receiver</InputLabel>
            <Select
              id='receiver_select'
              labelId='receiver_label'
              label='receiver'
              {...field}
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
    </>
  );
};

const Surrender: FC<{ battle: Battle, actor: CharactorBattling }> = ({ battle, actor }) => {
  const { battleRepository, dialogue } = useIO();
  // FIXME 降参した後にbattleの状態を変化させる気がするがどうかな
  const doSurrender = () => surrender(battleRepository, dialogue)(battle, actor, new Date(), createRandoms());

  return <Button variant='outlined' type="button" onClick={doSurrender}>降参</Button>;
};

const SkillSelect: FC<{
  actor: CharactorBattling,
  replace: UseFieldArrayReplace<DoSkillForm, 'receiversWithIsVisitor'>
  errors: FieldErrors<DoSkillForm>,
  control: Control<DoSkillForm>,
}> = ({ actor, replace, errors, control }) => {

  const skills = getSkills(actor);
  const skillOptions = skills
    .filter(skill => skill.mpConsumption <= actor.mp)
    .filter(skill => !underStatus(silent, actor) || skill.magicType === MAGIC_TYPE_NONE)
    .map(skill => ({ value: skill.name, label: skill.label }));
  skillOptions.push({ value: ACTION_DO_NOTHING, label: '何もしない' });

  // FIXME useCallback
  const onChange = (hookOnChange: HookOnChange) => (e: SelectChangeEvent<string>) => {
    const skillName = e.target.value;
    const skill = toSkill(skillName);
    if (skill) {
      replace(Array(skill.receiverCount).fill(''));
    } else {
      replace([]);
    }
    hookOnChange(e);
  };

  return (
    <Controller
      name='skillName'
      control={control}
      render={({ field }) => (
        <FormControl error={!!errors.skillName}>
          <InputLabel id="skill_label">skill</InputLabel>
          <Select
            id='skill_select'
            labelId='skill_label'
            label='skill'
            {...field}
            onChange={onChange(field.onChange)}
          >
            {skillOptions.map(skillOption => (
              <MenuItem key={`${skillOption.value}`} value={skillOption.value}>
                {skillOption.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{!!errors.skillName && errors.skillName.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};

const ACTION_STATUS_NONE = 'NONE' as const;
const ACTION_STATUS_START = 'START' as const;
const ACTION_STATUS_ING01 = 'ING01' as const;
const ACTION_STATUS_ING02 = 'ING02' as const;
const ACTION_STATUS_ING03 = 'ING03' as const;
const ACTION_STATUS_HIT = 'HIT' as const;
const ACTION_STATUS_DODGE = 'DODGE' as const;
type ACTION_STATUSES =
  | typeof ACTION_STATUS_NONE
  | typeof ACTION_STATUS_START
  | typeof ACTION_STATUS_ING01
  | typeof ACTION_STATUS_ING02
  | typeof ACTION_STATUS_ING03
  | typeof ACTION_STATUS_HIT
  | typeof ACTION_STATUS_DODGE
;

const BattlingImage: FC<{ actionStatus: ACTION_STATUSES, skill: Skill | null }> = ({ actionStatus, skill }) => {
  return (
    <Box sx={{ position: 'relative' }}>
      <Typography sx={{ position: 'absolute', top: '50%', left: '48%', transform: 'translate(-50%, -50%)' }}>{skill ? skill.label : ''}</Typography>
      <img src={`/BATTLING_${actionStatus}.jpg`} alt={`BATTLING_${actionStatus}`} />
    </Box>
  );
};

export const BattleContainer: FC<{ battle: Battle }> = ({ battle }) => {

  const [lastTurn, setLastTurn] = useState<Turn | null>(null);

  useEffect(() => {
    if (!lastTurn) {
      setLastTurn(getLastTurn(battle));
    }
  }, [lastTurn, battle]);

  const reloadTurn = useCallback(() => {
    setLastTurn(getLastTurn(battle));
  }, [battle]);

  return lastTurn
    ? <BattleTurn battle={battle} lastTurn={lastTurn} reloadTurn={reloadTurn} />
    : <Box>loading</Box>;
};

export const BattleTurn: FC<{
  battle: Battle,
  lastTurn: Turn,
  reloadTurn: () => void,
}> = ({ battle, lastTurn, reloadTurn }) => {

  const { battleRepository, dialogue } = useIO();

  const {
    handleSubmit,
    getValues,
    formState: { errors }, //, isSubmitting
    reset,
    control,
  } = useForm<DoSkillForm>({ resolver: zodResolver(doSkillFormSchema) });

  const { fields, replace } = useFieldArray({ control, name: 'receiversWithIsVisitor' });
  const [message, setMessage] = useState<string>('');
  const [receivers, setReceivers] = useState<(CharactorBattling | null)[]>([]);
  const [actionStatus, setActionStatus] = useState<ACTION_STATUSES>(ACTION_STATUS_NONE);

  const actor = turnActor(lastTurn);

  const skill = skillRepository.get(getValues('skillName'))

  const actSkill = async (doSkillForm: DoSkillForm) => {

    if (!actor) {
      setMessage('actor not found');
      return;
    }

    const result = await act(dialogue, battleRepository)(battle, actor, doSkillForm, lastTurn, () => new Date(), createRandoms);

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

    progressAction(result);
  };

  const addReceiver = (index: number) => () => {

    if (!actor) {
      setMessage('actor not found');
      return;
    }

    if (!skill) {
      setMessage('skill not selected');
      return;
    }

    let newReceivers = [...receivers];
    const receiverWithIsVisitor = getValues(`receiversWithIsVisitor.${index}.value` as const);
    if (!receiverWithIsVisitor) {
      return;
    }

    const result = simulate(battle, actor, skill, receiverWithIsVisitor, lastTurn, new Date());

    if (result instanceof DataNotFoundError) {
      if (receivers.length > index) {
        newReceivers.splice(index, 1, null);
        setReceivers(newReceivers);
      }
      return;
    }

    const { receiver, survive } = result;
    if (!survive) {
      receiver.hp = 0;
    }

    if (receivers.length <= index) {
      const shortage = index - receivers.length + 1;
      newReceivers = newReceivers.concat(Array(shortage).fill(undefined));
    }
    newReceivers.splice(index, 1, receiver);
    setReceivers(newReceivers);
  };

  const progressAction = (_newBattle: Battle) => {
    Promise.resolve(() => {
      setActionStatus(ACTION_STATUS_START);
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }).then(() => {
      return new Promise((resolve) => {
        setActionStatus(ACTION_STATUS_ING01);
        setTimeout(resolve, 1000);
      });
    }).then(() => {
      setActionStatus(ACTION_STATUS_ING02);
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }).then(() => {
      setActionStatus(ACTION_STATUS_ING03);
      return new Promise((resolve) => {
        setTimeout(resolve, 1000);
      });
    }).then(() => {
      // FIXME newBattleの結果を見てhit/dodgeを決める
      // 現状Turnにあたったか否かの結果がないので判断しづらい。
      // modelに手を入れてDoSkillにhit/dodgeの結果を持たせる形にしたい
      // あたった状態に関しては、結果としてのcharactor listがあるので、そちらを参照すればよく、hit/dodgeだけでいいはず
      // でも現状複数対象の場合に、結局それぞれの判定結果を表示できないUIなので、結果を見るほうがいい。
      // 見せ方含めて検討なので一旦pending
      replace([]);
      setActionStatus(ACTION_STATUS_HIT);
    });
  };

  const clear = () => {
    setReceivers([]);
    setActionStatus(ACTION_STATUS_NONE);
    reloadTurn();
    reset();
  };

  // FIXME Button loading={isSubmitting} loadingText="executing action..." としたかったがloadingがエラーになる
  return (
    <Container backLink="/battle/">
      <Stack>
        <Stack sx={{ pb: 1 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", width: '100%', pb: 1 }}>
            <Stack flex="0 0 70px" sx={{ justifyContent: "center" }}><Typography>Battle!</Typography></Stack>
            <Stack flex="1 0 110px" sx={{ justifyContent: "center" }}><Typography>{battle.title}</Typography></Stack>
            <Box flex="1 1 auto">{battle.result !== GameOngoing && <Button type="button" variant='outlined' onClick={() => battleRepository.exportJson(battle, '')} >Export</Button>}</Box>
          </Stack>
          <Box>
            <GameStatus battle={battle} />
          </Box>
        </Stack>
        {battle.result === GameOngoing && actor && (
          <Stack borderTop='1px solid royalblue'>
            <form onSubmit={handleSubmit(actSkill)}>
              {message && (<Typography>{message}</Typography>)}
              <Box sx={{ py: 1 }}>
                <Typography display="inline-block" sx={{ pr: 1 }}>{`${actor.name}のターン`}</Typography>
                <Chip variant="outlined" color='primary' label={actor.isVisitor ? 'VISITOR' : 'HOME'} />
              </Box>
              <Stack>
                <SkillSelect
                  actor={actor}
                  errors={errors}
                  replace={replace}
                  control={control}
                />
              </Stack>
              <Stack sx={{ justifyContent: "flex-start", p: 1, width: '100%' }}>
                {fields.map((item, index) => (
                  <Stack key={`receiversWithIsVisitor.${index}`}>
                    {skill && (
                      <ReceiverSelect
                        lastTurn={lastTurn}
                        index={index}
                        errors={errors}
                        control={control}
                        addReceiver={addReceiver(index)}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
              <Stack>
                <Box>
                  <CharactorStatus charactor={actor} />
                  {skill && (
                    <Box sx={{ pt: 1 }}>
                      <Typography>
                        {`Skill: ${skill.label} MP-${skill.mpConsumption} WT+${skill.additionalWt} 距離${skill.effectLength}`}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box sx={{ textAlign: 'center', py: 1 }}>
                  <BattlingImage actionStatus={actionStatus} skill={skill} />
                </Box>
                {receivers.map((receiver, index) => (
                  receiver && <Stack sx={{ pl: 5 }} key={`receiver-status-${index}`}><CharactorStatus charactor={receiver} /></Stack>
                ))}
                {!receivers.some(receiver => receiver !== null) && (
                  <Stack sx={{ pl: 2 }}>
                    <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
                      <Box sx={{ pr: 1 }} flex="1 1 auto"><Typography display="inline-block" sx={{ pr: 1 }}>名前: ?????</Typography></Box>
                    </Stack>
                  </Stack>
                )}
              </Stack>
              <Stack direction='row' sx={{ justifyContent: "flex-end", py: 1 }}>
                <Box sx={{ px: 1 }}>
                  {(actionStatus === ACTION_STATUS_HIT || actionStatus === ACTION_STATUS_DODGE) && (
                    <Button type="button" variant='outlined' sx={{ px: 1 }} onClick={clear}>Next Turn</Button>
                  )}
                  {!(actionStatus === ACTION_STATUS_HIT || actionStatus === ACTION_STATUS_DODGE) && (
                    <Button type="submit" variant='outlined' sx={{ px: 1 }}>実行</Button>
                  )}
                </Box>
                {battle.result === GameOngoing && (
                  <Box sx={{ px: 1 }}>
                    <Surrender battle={battle} actor={actor} />
                  </Box>
                )}
              </Stack>
            </form>
            <Box borderTop='1px solid royalblue' sx={{ py: 1 }}>
              <Box>
                <Typography variant='h5'>Action Orders</Typography>
              </Box>
              <Stack sx={{ justifyContent: "flex-start", p: 1, width: '100%' }}>
                {lastTurn.sortedCharactors.map((charactor, index) => (
                  <Box key={`CharactorDetail-${charactor.name}-${isVisitorString(charactor.isVisitor)}`} sx={{ pb: 2 }}>
                    <Box borderBottom='1px dotted royalblue'>
                      <Typography variant="h6">{index === 0 ? 'Now Actor' : `Action Order ${index}`}</Typography>
                    </Box>
                    <CharactorDetail charactor={charactor} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </Stack>
    </Container>
  );
};
