import type { Status } from "./charactor_status";
import type { SelectOption } from "../io/dialogue";
import type { Physical } from "./physical";

const basePhysical: Physical = {
  MaxHP: 300,
  WT: 100,
  move: 4,
};

export type AttachedStatus = {
  status: Status;
  restWt: number;
};

export type Charactor = {
  name: string;
};

export type CharactorBattling = Charactor & {
  statuses: AttachedStatus[];
  hp: number;
  restWt: number;
  isVisitor: boolean;
};

export type CopyAttachedStatus = (attachedStatus: AttachedStatus) => AttachedStatus;
export const copyAttachedStatus: CopyAttachedStatus = (attachedStatus) => ({ ...attachedStatus });

export type CopyCharactor = (charactor: Charactor) => Charactor;
export const copyCharactor: CopyCharactor = (charactor) => ({ ...charactor });

export type CopyCharactorBattling = (charactor: CharactorBattling) => CharactorBattling;
export const copyCharactorBattling: CopyCharactorBattling = (charactor) => ({
  ...charactor,
  statuses: charactor.statuses.map(copyAttachedStatus),
});

export function isBattling(charctor: Charactor): charctor is CharactorBattling {
  return "statuses" in charctor && "hp" in charctor && "restWt" in charctor && "isVisitor" in charctor;
}

export type GetSelectOption = (charactor: CharactorBattling) => SelectOption;
export const getSelectOption: GetSelectOption = (charactor) => ({
  label: `${charactor.isVisitor ? "V" : "H"}:${charactor.name}`,
  value: `${charactor.isVisitor ? "V" : "H"}:${charactor.name}`,
});

export type SelectCharactor = (candidates: CharactorBattling[], values: string[]) => CharactorBattling[];
export const selectCharactor: SelectCharactor = (candidates, values) =>
  candidates.filter((candidate) => values.includes(`${candidate.isVisitor ? "V" : "H"}:${candidate.name}`));

// FIXME acquirement削除に伴う応急処置。装備による補正がなくなったため、基礎値をそのまま返す
export type GetPhysical = (charactor: Charactor) => Physical;
export const getPhysical: GetPhysical = (_charactor) => basePhysical;

export type toBattleCharactor = (charactor: Charactor, isVisitor: boolean) => CharactorBattling;
export const toBattleCharactor: toBattleCharactor = (charactor, isVisitor) => {
  const physical = getPhysical(charactor);
  return {
    ...copyCharactor(charactor),
    statuses: [],
    hp: physical.MaxHP,
    restWt: physical.WT,
    isVisitor: isVisitor,
  };
};

export type CreateCharactor = (name: string) => Charactor;
export const createCharactor: CreateCharactor = (name) => ({ name });

export type IsVisitorString = (isVisitor: boolean) => string;
export const isVisitorString: IsVisitorString = (isVisitor) => (isVisitor ? "VISITOR" : "HOME");
