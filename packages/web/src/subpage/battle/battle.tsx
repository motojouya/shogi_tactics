import type { FC } from 'react';

import { Typography } from '@mui/material';
import { useLiveQuery } from "dexie-react-hooks";

import { BattleContainer } from '../../components/battle';
import { CharactorDuplicationError } from '@motojouya/kniw-core/model/party';
import { NotWearableErorr } from '@motojouya/kniw-core/model/acquirement';
import { JsonSchemaUnmatchError, DataNotFoundError } from '@motojouya/kniw-core/store_utility/schema';
import { useIO } from '../../components/context';
import { Container } from '../../components/utility';

export const BattleExsiting: FC<{ battleTitle: string }> = ({ battleTitle }) => {
  const { battleRepository } = useIO();
  const battle = useLiveQuery(() => battleRepository.get(battleTitle), [battleTitle]);

  if (
    battle instanceof NotWearableErorr ||
    battle instanceof DataNotFoundError ||
    battle instanceof CharactorDuplicationError ||
    battle instanceof JsonSchemaUnmatchError
  ) {
    return (
      <Container backLink="/battle/">
        <Typography>{battle.message}</Typography>
      </Container>
    );
  }

  if (!battle) {
    return (
      <Container backLink="/battle/">
        <Typography>{`${battleTitle}というbattleは見つかりません`}</Typography>
      </Container>
    );
  }

  return (<BattleContainer battle={battle} />);
};
