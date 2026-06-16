import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";

import { describe, it, expect } from "vitest";

import type { Unit } from "../../model/unit";

import { toBattle } from "../../store_schema/battle";
import { startBattle } from "./start";
import { GameOngoing } from "../../model/battle";

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
    },
  ],
  result: GameOngoing,
};

const battleRepository: BattleRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

const dialogue: Dialogue = {
  confirm: (_message) => true,
  notice: (_message) => {},
  getUuid: () => "0191e000-0000-7000-8000-000000000000",
  now: () => new Date("2023-06-29T12:12:21"),
};

const units: Unit[] = [
  { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [] },
  { side: "SECOND", piece: "pawn", hp: 1, steps: 0, statuses: [] },
];

describe("startBattle", () => {
  it("start battle", async () => {
    const battle = await startBattle(battleRepository, dialogue)(units, "first", "second", 4, 4, "v1");

    expect(battle.key).toBe("0191e000-0000-7000-8000-000000000000");
    expect(battle.first_player_name).toBe("first");
    expect(battle.second_player_name).toBe("second");
    expect(battle.stepBase).toBe(4);
    expect(battle.version).toBe("v1");
    // step6: 先頭Turn(編成)のみ。WTのwait Turnは廃止。
    expect(battle.turns.length).toBe(1);
    expect(battle.turns[0].units.length).toBe(2);
    expect(battle.turns[0].units[0].piece).toBe("king");
  });
});
