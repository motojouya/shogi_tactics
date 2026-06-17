import type { Battle } from "../model/battle";
import type { Database } from "./database";

import { CopyFailError } from "./database";
import { battleSchema } from "../model/battle";
import { parseJson, JsonSchemaUnmatchError } from "./schema";

const NAMESPACE = "battle";

// battle専用のrepository。disk_repositoryのgeneric抽象は廃し、Battleに素直に実装する。
// model型(Battle)をそのまま保存・取得し、取得時はbattleSchemaで検証(parseJson)するだけ(converter不要)。
export type BattleRepository = {
  save: (battle: Battle) => Promise<void>;
  list: () => Promise<string[]>;
  get: (key: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  remove: (key: string) => Promise<void>;
  importJson: (fileName: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  exportJson: (battle: Battle, fileName: string) => Promise<CopyFailError | null>;
};

export type CreateRepository = (database: Database) => Promise<BattleRepository>;
export const createRepository: CreateRepository = async (database) => {
  await database.checkNamespace(NAMESPACE);
  return {
    save: async (battle) => database.save(NAMESPACE, battle.key, battle),
    list: async () => database.list(NAMESPACE),
    get: async (key) => {
      const result = await database.get(NAMESPACE, key);
      if (!result) {
        return null;
      }
      return parseJson(battleSchema)(result);
    },
    remove: async (key) => database.remove(NAMESPACE, key),
    importJson: async (fileName) => {
      const result = await database.importJson(fileName);
      if (!result) {
        return null;
      }
      return parseJson(battleSchema)(result);
    },
    exportJson: async (battle, fileName) => database.exportJson(battle, fileName),
  };
};
