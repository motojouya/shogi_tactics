import type { BattleRepository } from "@motojouya/kniw-core/store/battle";
import type { Dialogue } from "../../../src/io/window_dialogue";

import { describe, it, expect } from "vitest";

import { GameOngoing, GameHome, GameVisitor } from "@motojouya/kniw-core/model/battle";
import { toBattle } from "@motojouya/kniw-core/store_schema/battle";
import { UserCancel } from "../../../src/io/window_dialogue";
import { surrender } from "../../../src/procedure/battle/surrender";
import { createAbsolute } from "@motojouya/kniw-core/model/random";

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
    },
  ],
  result: GameOngoing,
};

const battleRepository: BattleRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(battle)),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(battle)),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

// test
describe("surrender", () => {
  it("home surrender", async () => {
    const battleData = toBattle(testData);

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async (battle) => {
        expect(battle.result).toBe(GameVisitor);
      },
    };
    const dialogue: Dialogue = {
      confirm: () => true,
      notice: (_message) => {},
    };

    const battle = await surrender(mockRepo, dialogue)(
      battleData,
      battleData.home.charactors[0],
      new Date(),
      createAbsolute(),
    );

    expect(battle).toBe(null);
  });

  it("visitor surrender", async () => {
    const battleData = toBattle(testData);

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async (battle) => {
        expect(battle.result).toBe(GameHome);
      },
    };
    const dialogue: Dialogue = {
      confirm: () => true,
      notice: (_message) => {},
    };

    const battle = await surrender(mockRepo, dialogue)(
      battleData,
      battleData.visitor.charactors[0],
      new Date(),
      createAbsolute(),
    );

    expect(battle).toBe(null);
  });

  it("cancel", async () => {
    const battleData = toBattle(testData);

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async () => {
        expect.unreachable();
      },
    };
    const dialogue: Dialogue = {
      confirm: () => false,
      notice: (_message) => {},
    };

    const battle = await surrender(mockRepo, dialogue)(
      battleData,
      battleData.home.charactors[0],
      new Date(),
      createAbsolute(),
    );

    expect(battle).toBeInstanceOf(UserCancel);
  });
});
