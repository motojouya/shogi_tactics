import type { Battle } from "../model/battle";

import Dexie from "dexie";

import { battleSchema } from "../model/battle";
import { parseJson, importJsonFile, exportJsonFile } from "./utility";
import { CopyFailError, JsonSchemaUnmatchError } from "./error";

export type BattleRepository = {
  save: (battle: Battle) => Promise<void>;
  list: () => Promise<string[]>;
  get: (key: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  remove: (key: string) => Promise<void>;
  importJson: (fileName: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  exportJson: (battle: Battle, fileName: string) => Promise<CopyFailError | null>;
};

class BattleDB extends Dexie {
  battle!: Dexie.Table<Battle, string>;

  constructor() {
    super("ShogiTacticsDB");
    this.version(1).stores({
      battle: "key",
    });
  }
}

export type CreateBattleRepository = () => Promise<BattleRepository>;
export const createBattleRepository: CreateBattleRepository = async () => {
  const db = new BattleDB();
  return {
    save: async (battle) => {
      await db.battle.put(battle);
    },
    list: async () => {
      const keys = await db.battle.toCollection().primaryKeys();
      return keys.map((key) => String(key));
    },
    get: async (key) => {
      const result = await db.battle.get(key);
      if (!result) {
        return null;
      }
      return parseJson(battleSchema)(result);
    },
    remove: async (key) => {
      await db.battle.delete(key);
    },
    importJson: async (_fileName) => importJsonFile(battleSchema),
    exportJson: async (battle, fileName) => exportJsonFile(battle, fileName),
  };
};
