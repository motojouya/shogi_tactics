/* eslint react-refresh/only-export-components: 0 */
import type { ReactNode } from "react";

import type { Repository } from '../repository';

import { createContext, useContext } from "react";

// @ts-expect-error null許可したくないのでRepository形にしてる
const ContextIO = createContext<Repository>();

export type UseIO = () => Repository;
export const useIO: UseIO = () => {
  const io = useContext(ContextIO);
  if (!io) {
    throw new Error("no context");
  }
  return io
};

export const IOProvider: React.FC<{
  children: ReactNode;
  io: Repository;
}> = ({ children, io }) => (<ContextIO.Provider value={io}>{children}</ContextIO.Provider>);
