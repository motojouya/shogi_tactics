export type MemoryRepository<T> = {
  get: (name: string) => T | null;
  list: string[];
  all: T[];
};

export type CreateMemoryRepository<T> = (items: Record<string, T>) => MemoryRepository<T>;
export const createMemoryRepository = <T>(items: Record<string, T>): MemoryRepository<T> => ({
  get: (name) => items[name],
  list: Object.keys(items),
  all: Object.values(items),
});
