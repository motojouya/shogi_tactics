/* eslint react-refresh/only-export-components: 0 */
import type { ReactNode } from "react";

import type { Dialogue } from '../io/window_dialogue';
import type { PartyRepository } from '@motojouya/kniw-core/store/party';
import type { BattleRepository } from '@motojouya/kniw-core/store/battle';

import { createContext, useContext } from "react";

export type IO = {
  dialogue: Dialogue;
  partyRepository: PartyRepository;
  battleRepository: BattleRepository;
};

// @ts-expect-error null許可したくないのでIO形にしてる
const ContextIO = createContext<IO>();

export type UseIO = () => IO;
export const useIO: UseIO = () => {
  const io = useContext(ContextIO);
  if (!io) {
    throw new Error("no context");
  }
  return io
};

export const IOProvider: React.FC<{
  children: ReactNode;
  io: IO;
}> = ({ children, io }) => (<ContextIO.Provider value={io}>{children}</ContextIO.Provider>);
