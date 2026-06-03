import type { FC } from 'react';
import type { Acquirement } from '@motojouya/kniw-core/model/acquirement';
import type { Charactor } from '@motojouya/kniw-core/model/charactor';
import type { PartyForm } from '../form/party';

import { useState, useEffect, useCallback } from 'react';
import {
  Control,
  Controller,
  FieldError,
  FieldErrors,
  Merge,
  FieldErrorsImpl,
  UseFormRegister,
  UseFormGetValues,
} from 'react-hook-form';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Chip,
  Button,
  TextField,
  Box,
  Stack,
  Typography,
} from '@mui/material';

import { NotWearableErorr } from '@motojouya/kniw-core/model/acquirement';
import { DataNotFoundError } from '@motojouya/kniw-core/store_utility/schema';
import {
  raceRepository,
  blessingRepository,
  clothingRepository,
  weaponRepository,
} from '@motojouya/kniw-core/store/acquirement';
import {
  isBattling,
  getPhysical,
  getAbilities,
  getSkills,
} from '@motojouya/kniw-core/model/charactor';
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

type AcquirementName = "name" | "charactors" | `charactors.${number}` | `charactors.${number}.name` | `charactors.${number}.race` | `charactors.${number}.blessing` | `charactors.${number}.clothing` | `charactors.${number}.weapon`;

const SelectAcquirement: FC<{
  acquirementName: AcquirementName,
  acquirementType: string,
  allAcquirements: Acquirement[],
  onBlur: () => void,
  error: FieldError | undefined,
  control: Control<PartyForm>,
}> = ({ acquirementName, acquirementType, allAcquirements, onBlur, error, control }) => {
  return (
    <Controller
      name={acquirementName}
      control={control}
      render={({ field }) => (
        <FormControl error={!!error}>
          <InputLabel id={`${acquirementName}.select_label`}>{acquirementType}</InputLabel>
          <Select
            labelId={`${acquirementName}.select_label`}
            id={`${acquirementName}.select`}
            name={field.name}
            value={field.value}
            label={acquirementType}
            onChange={field.onChange}
            onBlur={onBlur}
          >
            {allAcquirements.map(acquirement => (
              <MenuItem key={`${acquirementName}.${acquirement.name}`} value={acquirement.name}>
                {acquirement.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{!!error && error.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export const CharactorStatus: FC<{ charactor: Charactor }> = ({ charactor }) => {

  const physical = getPhysical(charactor);

  let hpText: string;
  let mpText: string;
  let wtText: string;
  let statusesText: string;
  let isVisitorTag;

  if (isBattling(charactor)) {
    hpText = `${charactor.hp}/${physical.MaxHP}`;
    mpText = `${charactor.mp}/${physical.MaxMP}`;
    wtText = `${charactor.restWt}(${physical.WT})`;
    statusesText = charactor.statuses.map(attachedStatus => `${attachedStatus.status.label}(${attachedStatus.restWt})`).join(', ');
    isVisitorTag = <Chip label={charactor.isVisitor ? 'VISITOR' : 'HOME'} variant="outlined" color='primary' />;

  } else {
    hpText = `${physical.MaxHP}/${physical.MaxHP}`;
    mpText = `${physical.MaxMP}/${physical.MaxMP}`;
    wtText = `${physical.WT}(${physical.WT})`;
    statusesText = '-';
    isVisitorTag = null;
  }

  return (
    <>
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 1 }} flex="1 1 auto"><Typography display="inline-block" sx={{ pr: 1 }}>名前: {`${charactor.name}`}</Typography>{isVisitorTag}</Box>
      </Stack>
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 1 }} flex="0 0 110px"><Typography>HP: {hpText}</Typography></Box>
        <Box sx={{ pr: 1 }} flex="0 0 110px"><Typography>MP: {mpText}</Typography></Box>
        <Box sx={{ pr: 1 }} flex="0 0 110px"><Typography>WT: {wtText}</Typography></Box>
        <Box sx={{ pr: 1 }} flex="1 1 auto"><Typography>ステータス: {statusesText}</Typography></Box>
      </Stack>
    </>
  );
};

export const CharactorDetail: FC<{ charactor: Charactor }> = ({ charactor }) => {
  const physical = getPhysical(charactor);

  const abilities = getAbilities(charactor);
  const abilitiesText = abilities.map(ability => ability.label).join(', ');

  const skills = getSkills(charactor);
  const skillsText = skills.map(skill => skill.label).join(', ');

  return (
    <Stack>
      <CharactorStatus charactor={charactor} />
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 2 }}><Typography>種族: {charactor.race.label}    </Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>祝福: {charactor.blessing.label}</Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>装備: {charactor.clothing.label}</Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>武器: {charactor.weapon.label}  </Typography></Box>
      </Stack>
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
        <Box sx={{ pr: 2 }}><Typography>アビリティ: {abilitiesText}</Typography></Box>
        <Box sx={{ pr: 2 }}><Typography>スキル: {skillsText}       </Typography></Box>
      </Stack>
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
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
      <Stack direction="row" borderBottom='1px dotted royalblue' sx={{ justifyContent: "flex-start", flexWrap: 'wrap' }}>
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
  control: Control<PartyForm>,
}> = ({ register, getValues, remove, errors, index, control }) => {

  const nameError = getCharactorError(errors, index, 'name');
  const [charactor, setCharactor] = useState<Charactor | string>('入力してください');

  const calculateCharactor = useCallback(() => {
    const hiredCharactor = toCharactor(getValues(`charactors.${index}` as const));

    if (hiredCharactor instanceof DataNotFoundError || hiredCharactor instanceof EmptyParameter) {
      setCharactor('入力してください');
      return;
    }
    if (hiredCharactor instanceof NotWearableErorr) {
      setCharactor('選択できない組み合わせです');
      return;
    }
    setCharactor(hiredCharactor);
  }, [getValues, index, setCharactor]);

  useEffect(calculateCharactor, [calculateCharactor]);

  return (
    <Stack direction="column" border='1px solid royalblue' borderRadius="5px" sx={{ px: 1, py: 2, mb: 1, justifyContent: "flex-start" }}>
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
        <SelectAcquirement
          acquirementType='race'
          acquirementName={`charactors.${index}.race`}
          allAcquirements={raceRepository.all}
          error={getCharactorError(errors, index, 'race')}
          onBlur={calculateCharactor}
          control={control}
        />
        <SelectAcquirement
          acquirementType='blessing'
          acquirementName={`charactors.${index}.blessing`}
          allAcquirements={blessingRepository.all}
          error={getCharactorError(errors, index, 'blessing')}
          onBlur={calculateCharactor}
          control={control}
        />
        <SelectAcquirement
          acquirementType='clothing'
          acquirementName={`charactors.${index}.clothing`}
          allAcquirements={clothingRepository.all}
          error={getCharactorError(errors, index, 'clothing')}
          onBlur={calculateCharactor}
          control={control}
        />
        <SelectAcquirement
          acquirementType='weapon'
          acquirementName={`charactors.${index}.weapon`}
          allAcquirements={weaponRepository.all}
          error={getCharactorError(errors, index, 'weapon')}
          onBlur={calculateCharactor}
          control={control}
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
