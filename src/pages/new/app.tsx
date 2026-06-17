import type { FC } from 'react';

import { BattleIO } from '../../components/battle_io';
import { BattleNew } from '../../subpage/battle/new';

// /new : 新規battleの登録画面
export const App: FC = () => (
  <BattleIO>
    <BattleNew />
  </BattleIO>
);
