import { describe, it, expect } from "vitest";

import type { Database } from "../../src/io/database";
import type { Battle } from "../../src/model/battle";
import { GameOngoing } from "../../src/model/battle";
import { toBattle } from "../../src/store_schema/battle";
import { createRepository } from "../../src/store/battle";
import { format } from "date-fns";

const testData = {
  title: "first-title",
  home: {
    name: "home",
    charactors: [
      {
        name: "sam",
        race: "human",
        blessing: "earth",
        clothing: "steelArmor",
        weapon: "swordAndShield",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 120,
        isVisitor: false,
      },
      {
        name: "sara",
        race: "human",
        blessing: "earth",
        clothing: "redRobe",
        weapon: "rubyRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 115,
        isVisitor: false,
      },
    ],
  },
  visitor: {
    name: "visitor",
    charactors: [
      {
        name: "john",
        race: "human",
        blessing: "earth",
        clothing: "steelArmor",
        weapon: "swordAndShield",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 130,
        isVisitor: true,
      },
      {
        name: "noa",
        race: "human",
        blessing: "earth",
        clothing: "redRobe",
        weapon: "rubyRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 110,
        isVisitor: true,
      },
    ],
  },
  turns: [
    {
      datetime: "2023-06-29T12:12:21",
      action: {
        type: "TIME_PASSING",
        wt: 0,
      },
      sortedCharactors: [
        {
          name: "sam",
          race: "human",
          blessing: "earth",
          clothing: "steelArmor",
          weapon: "swordAndShield",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 120,
          isVisitor: false,
        },
        {
          name: "sara",
          race: "human",
          blessing: "earth",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 115,
          isVisitor: false,
        },
        {
          name: "john",
          race: "human",
          blessing: "earth",
          clothing: "steelArmor",
          weapon: "swordAndShield",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 130,
          isVisitor: true,
        },
        {
          name: "noa",
          race: "human",
          blessing: "earth",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 110,
          isVisitor: true,
        },
      ],
      field: {
        climate: "SUNNY",
      },
      randoms: {
        times: 1,
        damage: 1,
        accuracy: 1,
      },
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
      expect(typedBattle.title).toBe("first-title");

      const home = typedBattle.home;
      expect(home.name).toBe("home");
      expect(home.charactors.length).toBe(2);
      expect(home.charactors[0].name).toBe("sam");
      expect(home.charactors[1].name).toBe("sara");

      const visitor = typedBattle.visitor;
      expect(visitor.name).toBe("visitor");
      expect(visitor.charactors.length).toBe(2);
      expect(visitor.charactors[0].name).toBe("john");
      expect(visitor.charactors[1].name).toBe("noa");

      const turns = typedBattle.turns;
      expect(turns.length).toBe(1);
      expect(formatDate(turns[0].datetime)).toBe("2023-06-29T12:12:21");
      if (turns[0].action.type === "TIME_PASSING") {
        expect(turns[0].action.type).toBe("TIME_PASSING");
        expect(turns[0].action.wt).toBe(0);
      } else {
        expect.unreachable("type shoud be TIME_PASSING");
      }

      expect(turns[0].sortedCharactors.length).toBe(4);
      expect(turns[0].sortedCharactors[0].name).toBe("sam");
      expect(turns[0].sortedCharactors[1].name).toBe("sara");
      expect(turns[0].sortedCharactors[2].name).toBe("john");
      expect(turns[0].sortedCharactors[3].name).toBe("noa");

      expect(turns[0].field.climate).toBe("SUNNY");

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
