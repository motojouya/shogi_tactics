import { describe, it, expect } from "vitest";

import { DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";
import { toBattle } from "@motojouya/kniw-core/store_schema/battle";
import { GameOngoing } from "@motojouya/kniw-core/model/battle";
import { skillRepository } from "@motojouya/kniw-core/store/skill";
import { simulate } from "../../../src/procedure/battle/simulate";

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

describe("simulate", () => {
  it("simulate", () => {
    const battle = toBattle(battleData);
    const actor = battle.home.charactors[0];
    const skill = skillRepository.get("chop");
    const receiverWithIsVisitor = "john__VISITOR";
    const lastTurn = battle.turns[battle.turns.length - 1];
    const actionDate = new Date();

    const result = simulate(battle, actor, skill, receiverWithIsVisitor, lastTurn, actionDate);

    expect(result).toEqual({
      receiver: { ...battle.visitor.charactors[0], hp: 45 },
      survive: true,
    });
  });
  it("simulate not survive", () => {
    const battle = toBattle(battleData);
    battle.visitor.charactors[1].hp = 1;
    battle.turns[0].sortedCharactors[3].hp = 1;

    const actor = battle.home.charactors[0];
    const skill = skillRepository.get("chop");
    const receiverWithIsVisitor = "noa__VISITOR";
    const lastTurn = battle.turns[battle.turns.length - 1];
    const actionDate = new Date();

    const result = simulate(battle, actor, skill, receiverWithIsVisitor, lastTurn, actionDate);

    expect(result).toEqual({
      receiver: { ...battle.visitor.charactors[1], hp: 1 },
      survive: false,
    });
  });
  it("simulate not found", () => {
    const battle = toBattle(battleData);
    const actor = battle.home.charactors[0];
    const skill = skillRepository.get("chop");
    const receiverWithIsVisitor = "NOT_FOUND__VISITOR";
    const lastTurn = battle.turns[battle.turns.length - 1];
    const actionDate = new Date();

    const result = simulate(battle, actor, skill, receiverWithIsVisitor, lastTurn, actionDate);

    expect(result).toBeInstanceOf(DataNotFoundError);
  });
});
