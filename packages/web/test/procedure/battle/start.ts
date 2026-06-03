import type { BattleRepository } from "@motojouya/kniw-core/store/battle";

import { describe, it, expect } from "vitest";

import { toBattle } from "@motojouya/kniw-core/store_schema/battle";
import { toParty } from "@motojouya/kniw-core/store_schema/party";
import { startBattle } from "../../../src/procedure/battle/start";
import { GameOngoing } from "@motojouya/kniw-core/model/battle";

const battleData = {
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

const homeData = {
  name: "home",
  charactors: [
    {
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "steelArmor",
      weapon: "swordAndShield",
    },
    {
      name: "sara",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
    },
  ],
};

const visitorData = {
  name: "visitor",
  charactors: [
    {
      name: "sam",
      race: "human",
      blessing: "earth",
      clothing: "steelArmor",
      weapon: "swordAndShield",
    },
    {
      name: "sara",
      race: "human",
      blessing: "earth",
      clothing: "redRobe",
      weapon: "rubyRod",
    },
  ],
};

const battleRepository: BattleRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

describe("startBattle", () => {
  it("start battle", async () => {
    const homeParty = toParty(homeData);
    const visitorParty = toParty(visitorData);
    const battle = await startBattle(battleRepository)("title", homeParty, visitorParty, new Date());

    expect(battle.title).toBe("title");
    expect(battle.home.name).toBe("home");
    expect(battle.visitor.name).toBe("visitor");
    expect(battle.turns.length).toBe(2);
  });
});
