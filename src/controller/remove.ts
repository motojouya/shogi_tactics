import type { Repository } from "../repository";

export type RemoveBattle = (repository: Repository) => (key: string) => Promise<void>;
export const removeBattle: RemoveBattle = (repository) => async (key) => {
  const { battle: battleRepository, local } = repository;
  if (!local.confirm("この対戦を削除しますか？")) {
    return;
  }
  await battleRepository.remove(key);
};
