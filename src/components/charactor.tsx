import type { FC } from 'react';
import type { Charactor } from '../model/charactor';
import type { PartyForm } from '../form/party';

import { useState, useCallback } from 'react';
import {
  type FieldError,
  type FieldErrors,
  type Merge,
  type FieldErrorsImpl,
  type UseFormRegister,
  type UseFormGetValues,
} from 'react-hook-form';
import {
  Chip,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import {
  isBattling,
  getPhysical,
} from '../model/charactor';
import { getSkills } from '../store/skill';
import { toCharactor } from '../form/charactor';
import { EmptyParameter } from '../io/window_dialogue';

type GetCharactorError = (errors: FieldErrors, i: number, property: string) => FieldError | undefined;
const getCharactorError: GetCharactorError = (errors, i, property) => {
  const errorsCharactors = errors.charactors;
  if (!errorsCharactors) {
    return errorsCharactors;
  }
  // FIXME
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errorsCharactorIndexed = (errorsCharactors as Merge<FieldError, FieldErrorsImpl<any>>)[i];
  if (!errorsCharactorIndexed) {
    return errorsCharactorIndexed;
  }
  // FIXME
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const error = (errorsCharactorIndexed as Merge<FieldError, FieldErrorsImpl<any>>)[property];
  if (!error) {
    return error;
  }

  return error as FieldError;
};

export const CharactorStatus: FC<{ charactor: Charactor }> = ({ charactor }) => {

  const physical = getPhysical(charactor);

  let hpText: string;
  let wtText: string;
  let statusesText: string;
  let isVisitorTag;

  if (isBattling(charactor)) {
    hpText = `${charactor.hp}/${physical.MaxHP}`;
    wtText = `${charactor.restWt}(${physical.WT})`;
    statusesText = charactor.statuses.map(attachedStatus => `${attachedStatus.status.label}(${attachedStatus.restWt})`).join(', ');
    isVisitorTag = <Chip label={charactor.isVisitor ? 'VISITOR' : 'HOME'} variant="outlined" color='primary' />;

  } else {
    hpText = `${physical.MaxHP}/${physical.MaxHP}`;
    wtText = `${physical.WT}(${physical.WT})`;
    statusesText = '-';
    isVisitorTag = null;
  }

  return (
    <>
      <Stack direction="row" sx={{ borderBottom: '1px dotted royalblue', justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 1, flex: "1 1 auto" }}><Typography sx={{ display: "inline-block", pr: 1 }}>名前: {`${charactor.name}`}</Typography>{isVisitorTag}</Box>
      </Stack>
      <Stack direction="row" sx={{ borderBottom: '1px dotted royalblue', justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 1, flex: "0 0 110px" }}><Typography>HP: {hpText}</Typography></Box>
        <Box sx={{ pr: 1, flex: "0 0 110px" }}><Typography>WT: {wtText}</Typography></Box>
        <Box sx={{ pr: 1, flex: "1 1 auto" }}><Typography>ステータス: {statusesText}</Typography></Box>
      </Stack>
    </>
  );
};

export const CharactorDetail: FC<{ charactor: Charactor }> = ({ charactor }) => {
  const physical = getPhysical(charactor);

  const skills = getSkills();
  const skillsText = skills.map(skill => skill.label).join(', ');

  return (
    <Stack>
      <CharactorStatus charactor={charactor} />
      <Stack direction="row" sx={{ borderBottom: '1px dotted royalblue', justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 2 }}><Typography>スキル: {skillsText}       </Typography></Box>
      </Stack>
      <Stack direction="row" sx={{ borderBottom: '1px dotted royalblue', justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 2 }}><Typography>STR: {physical.STR}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>VIT: {physical.VIT}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>DEX: {physical.DEX}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>AGI: {physical.AGI}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>AVD: {physical.AVD}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>INT: {physical.INT}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>MND: {physical.MND}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>RES: {physical.RES}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>MOVE: {physical.move}</Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>JUMP: {physical.jump}</Typography></Box>
      </Stack>
      <Stack direction="row" sx={{ borderBottom: '1px dotted royalblue', justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 2 }}><Typography>火属性: {physical.FireSuitable}     </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>岩属性: {physical.RockSuitable}     </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>水属性: {physical.WaterSuitable}    </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>氷属性: {physical.IceSuitable}      </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>風属性: {physical.AirSuitable}      </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>雷属性: {physical.ThunderSuitable}  </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>刺突耐性: {physical.StabResistance} </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>斬撃耐性: {physical.SlashResistance}</Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>打撃耐性: {physical.BlowResistance} </Typography></Box>
      </Stack>
    </Stack>
  );
};

export const CharactorCard: FC<{
  register: UseFormRegister<PartyForm>,
  getValues: UseFormGetValues<PartyForm>,
  remove: (index?: number | number[]) => void,
  errors: FieldErrors<PartyForm>,
  index: number,
}> = ({ register, getValues, remove, errors, index }) => {

  const nameError = getCharactorError(errors, index, 'name');
  const [charactor, setCharactor] = useState<Charactor | string>(() => {
    const hiredCharactor = toCharactor(getValues(`charactors.${index}` as const));

    if (hiredCharactor instanceof EmptyParameter) {
      return '入力してください';
    }
    return hiredCharactor;
  });

  const calculateCharactor = useCallback(() => {
    const hiredCharactor = toCharactor(getValues(`charactors.${index}` as const));

    if (hiredCharactor instanceof EmptyParameter) {
      setCharactor('入力してください');
      return;
    }
    setCharactor(hiredCharactor);
  }, [getValues, index, setCharactor]);

  return (
    <Stack direction="column" sx={{ border: '1px solid royalblue', borderRadius: "5px", px: 1, py: 2, mb: 1, justifyContent: "flex-start" }}>
      <Stack direction="column" sx={{ justifyContent: "flex-start" }}>
        <TextField
          error={!!nameError}
          label="Name"
          placeholder="Name"
          variant="outlined"
          {...register(`charactors.${index}.name` as const, { onBlur: calculateCharactor })}
          helperText={!!nameError && nameError.message}
          sx={{ pb: 1 }}
        />
      </Stack>
      <Box>
        <Button variant="contained" type="button" onClick={() => remove(index)}>Fire</Button>
      </Box>
      <Box>
        {typeof charactor === 'string' ? <Typography>{charactor}</Typography> : <CharactorDetail charactor={charactor} />}
      </Box>
    </Stack>
  );
};
