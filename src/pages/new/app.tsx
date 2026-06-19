import type { FC } from 'react';

import { BattleIO } from '../../components/battle_io';
import { BattleCreation } from '../../feature/creation';

// /new : 新規battleの登録画面。画面表現はfeature/creationに移設し、ここはprovider配線のみ(S19)。
export const App: FC = () => (
  <BattleIO>
    <BattleCreation />
  </BattleIO>
);
