import type { BattleRepository } from "@motojouya/kniw-core/store/battle";
import type { Dialogue } from "../../../src/io/window_dialogue";

import { describe, it, expect } from "vitest";

import { toBattle } from "@motojouya/kniw-core/store_schema/battle";
import { GameOngoing } from "@motojouya/kniw-core/model/battle";
import { act } from "../../../src/procedure/battle/act";
import { DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";
import { UserCancel } from "../../../src/io/window_dialogue";
import { createAbsolute } from "@motojouya/kniw-core/model/random";

const skillForm = {
  skillName: "chop",
  receiversWithIsVisitor: [{ value: "john__VISITOR" }],
};

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
        mp: 50,
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
          mp: 50,
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
  get: (_name) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(toBattle(battleData))),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

describe("act", () => {
  it("act", async () => {
    const battle = toBattle(battleData);
    const actor = battle.home.charactors[0];
    const lastTurn = battle.turns[battleData.turns.length - 1];

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async (_battle) => {
        expect(true).toBe(true);
      },
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("実行していいですか？");
        return true;
      },
      notice: (_message) => {},
    };

    const result = await act(dialogue, mockRepo)(battle, actor, skillForm, lastTurn, () => new Date(), createAbsolute);

    const turnJustBefore = result.turns.pop();
    const turnNextBefore = result.turns.pop();

    expect(result).toStrictEqual(battle);

    expect(turnJustBefore.action.type).toBe("TIME_PASSING");
    expect(turnNextBefore.action.type).toBe("DO_SKILL");
  });

  it("data not found", async () => {
    const battle = toBattle(battleData);
    const actor = battle.home.charactors[0];
    const lastTurn = battle.turns[battleData.turns.length - 1];

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async (_battle) => {
        expect.unreachable();
      },
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("実行していいですか？");
        return true;
      },
      notice: (_message) => {},
    };

    const result = await act(dialogue, mockRepo)(
      battle,
      actor,
      { ...skillForm, skillName: "not-found" },
      lastTurn,
      () => new Date(),
      createAbsolute,
    );

    expect(result).toBeInstanceOf(DataNotFoundError);
  });

  it("cancel", async () => {
    const battle = toBattle(battleData);
    const actor = battle.home.charactors[0];
    const lastTurn = battle.turns[battleData.turns.length - 1];

    const mockRepo: BattleRepository = {
      ...battleRepository,
      save: async (_battle) => {
        expect.unreachable();
      },
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("実行していいですか？");
        return false;
      },
      notice: (_message) => {},
    };

    const result = await act(dialogue, mockRepo)(battle, actor, skillForm, lastTurn, () => new Date(), createAbsolute);

    expect(result).toBeInstanceOf(UserCancel);
  });
});
