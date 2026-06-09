import type { CharactorBattling } from "./charactor";

export type Ability = {
  name: string;
  label: string;
  wait: Wait;
  description: string;
};

export type Wait = (wt: number, charactor: CharactorBattling) => CharactorBattling;
export const justWait: Wait = (_wt, charactor) => charactor;
