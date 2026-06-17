import type { FC } from 'react';

import { BattleIO } from '../../components/battle_io';
import { BattleList } from '../../subpage/battle/list';

// /list : battle一覧の表示
export const App: FC = () => (
  <BattleIO>
    <BattleList />
  </BattleIO>
);
