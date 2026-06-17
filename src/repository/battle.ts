import type { Battle } from "../model/battle";

import Dexie from "dexie";

import { battleSchema } from "../model/battle";
import { parseJson } from "./utility";
import { CopyFailError, JsonSchemaUnmatchError } from "./error";

// battle専用のrepository。schema変換が無くなりbattle固有のロジックも無いため、Database抽象を廃しDexieを直接使う。
// model型(Battle)をそのまま保存・取得し、取得時はbattleSchemaで検証(parseJson)するだけ。
export type BattleRepository = {
  save: (battle: Battle) => Promise<void>;
  list: () => Promise<string[]>;
  get: (key: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  remove: (key: string) => Promise<void>;
  importJson: (fileName: string) => Promise<Battle | JsonSchemaUnmatchError | null>;
  exportJson: (battle: Battle, fileName: string) => Promise<CopyFailError | null>;
};

// keyを主キーとするbattleテーブルのみ。IndexedDB(Dexie)はDateを構造化クローンでネイティブ保存する。
class BattleDB extends Dexie {
  battle!: Dexie.Table<Battle, string>;

  constructor() {
    super("KniwDB");
    this.version(1).stores({
      battle: "key",
    });
  }
}

const pickerOpts = {
  types: [
    {
      description: "JSON",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
  excludeAcceptAllOption: true,
};

export type CreateRepository = () => Promise<BattleRepository>;
export const createRepository: CreateRepository = async () => {
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
    importJson: async (_fileName) => {
      // @ts-expect-error window is not defined
      const [fileHandle] = await window.showOpenFilePicker({ ...pickerOpts, multiple: false });
      const file = await fileHandle.getFile();
      const text = await file.text();
      return parseJson(battleSchema)(JSON.parse(text));
    },
    exportJson: async (battle, fileName) => {
      // @ts-expect-error window is not defined
      const newHandle = await window.showSaveFilePicker({ ...pickerOpts, suggestedName: `${fileName}.json` });
      const writableStream = await newHandle.createWritable();
      await writableStream.write(JSON.stringify(battle));
      await writableStream.close();
      return null;
    },
  };
};
