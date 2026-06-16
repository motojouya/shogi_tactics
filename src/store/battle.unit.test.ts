import { describe, it, expect } from "vitest";

import type { Database } from "../io/database";
import type { Battle } from "../model/battle";
import { GameOngoing } from "../model/battle";
import { toBattle } from "../store_schema/battle";
import { createRepository } from "./battle";
import { format } from "date-fns";

const testData = {
  key: "0191e000-0000-7000-8000-000000000000",
  first_player_name: "home",
  second_player_name: "visitor",
  stepBase: 4,
  unitCount: 2,
  version: "v1",
  turns: [
    {
      datetime: "2023-06-29T12:12:21",
      order: { type: "FORMATION" },
      units: [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [] },
      ],
    },
  ],
  result: GameOngoing,
};

const dbMock: Database = {
  save: (_namespace, _objctKey, _obj) => new Promise((resolve, _reject) => resolve()),
  get: (_namespace, _objctKey) => new Promise((resolve, _reject) => resolve(testData)),
  remove: (_namespace, _objctKey) => new Promise((resolve, _reject) => resolve()),
  list: (_namespace) => new Promise((resolve, _reject) => resolve(["2023-06-29T12:12:12", "2023-06-29T15:15:15"])),
  checkNamespace: (_namespace) => new Promise((resolve, _reject) => resolve()),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(testData)),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

type FormatDate = (date: Date) => string;
const formatDate: FormatDate = (date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

describe("Battle#createRepository", function () {
  it("save", async () => {
    const repository = await createRepository(dbMock);
    const battle = toBattle(testData) as Battle;
    await repository.save(battle);
    expect(true).toBe(true);
  });
  it("get", async () => {
    const repository = await createRepository(dbMock);
    const battle = await repository.get("2023-06-29T12:12:12");
    const typedBattle = battle as Battle;
    if (typedBattle) {
      expect(typedBattle.key).toBe("0191e000-0000-7000-8000-000000000000");
      expect(typedBattle.first_player_name).toBe("home");
      expect(typedBattle.second_player_name).toBe("visitor");
      expect(typedBattle.stepBase).toBe(4);
      expect(typedBattle.unitCount).toBe(2);
      expect(typedBattle.version).toBe("v1");

      const turns = typedBattle.turns;
      expect(turns.length).toBe(1);
      expect(formatDate(turns[0].datetime)).toBe("2023-06-29T12:12:21");
      expect(turns[0].order.type).toBe("FORMATION");
      expect(turns[0].units.length).toBe(2);
      expect(turns[0].units[0].piece).toBe("king");

      expect(typedBattle.result).toBe(GameOngoing);
    } else {
      expect.unreachable("battle shoud be exist");
    }
  });
  it("remove", async () => {
    const repository = await createRepository(dbMock);
    await repository.remove("2023-06-29T12:12:12");
    expect(true).toBe(true);
  });
  it("list", async () => {
    const repository = await createRepository(dbMock);
    const battleList = await repository.list();
    expect(battleList.length).toBe(2);
    expect(battleList[0]).toBe("2023-06-29T12:12:12");
    expect(battleList[1]).toBe("2023-06-29T15:15:15");
  });
});
