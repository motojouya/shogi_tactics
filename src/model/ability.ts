import type { CharactorBattling } from "./charactor";
import type { Randoms } from "./random";

export type Ability = {
  name: string;
  label: string;
  wait: Wait;
  description: string;
};

export type Wait = (wt: number, charactor: CharactorBattling, randoms: Randoms) => CharactorBattling;
export const justWait: Wait = (_wt, charactor, _randoms) => charactor;
