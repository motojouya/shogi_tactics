import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";

import { describe, it, expect } from "vitest";

import { listBattles } from "./list";
import { GameOngoing } from "../model/battle";
import { JsonSchemaUnmatchError } from "../model/error";

const battle = (key: string): Battle => ({
  turns: [],
  result: GameOngoing,
  key,
  first_player_name: "first",
  second_player_name: "second",
  stepBase: 4,
  unitCount: 4,
  version: "v1",
});

const baseLocal: Local = {
  confirm: () => true,
  notice: () => {},
  getUuid: () => "0191e000-0000-7000-8000-000000000000",
  now: () => new Date("2023-06-29T12:12:21"),
  transit: () => {},
  getSearchParams: () => new URLSearchParams(),
};

const buildRepository = (battleRepository: BattleRepository, local: Local = baseLocal): Repository =>
  ({ battle: battleRepository, local }) as unknown as Repository;

describe("listBattles", () => {
  it("取得失敗(error/null)を除外し、Battleのみ返す", async () => {
    const store: Record<string, Battle | JsonSchemaUnmatchError | null> = {
      a: battle("a"),
      b: null,
      c: new JsonSchemaUnmatchError("c", "壊れたデータ"),
      d: battle("d"),
    };
    const battleRepository: BattleRepository = {
      save: async () => {},
      get: async (key) => store[key],
      remove: async () => {},
      list: async () => ["a", "b", "c", "d"],
      importJson: async () => null,
      exportJson: async () => null,
    };

    const result = await listBattles(buildRepository(battleRepository))();

    expect(result.map((b) => b.key)).toEqual(["a", "d"]);
  });
});
