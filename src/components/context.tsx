/* eslint react-refresh/only-export-components: 0 */
import type { ReactNode } from "react";

import type { Local } from '../repository/local';
import type { BattleRepository } from '../repository/battle';

import { createContext, useContext } from "react";

export type IO = {
  dialogue: Local;
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
