import type { Battle } from "../../src/model/battle";
import type { Skill } from "../../src/model/skill";
import type { CharactorBattling } from "../../src/model/charactor";
import type { BattleJson } from "../../src/store_schema/battle";

import { describe, it, expect } from "vitest";

import { actToCharactor, GameOngoing } from "../../src/model/battle";
import { toBattle } from "../../src/store_schema/battle";

import { toCharactorBattling } from "../../src/store_schema/charactor";
import { skillRepository } from "../../src/store/skill";

const testData = {
  title: "first-title",
  home: {
    name: "home",
    charactors: [
      {
        name: "sam",
        race: "human",
        blessing: "mind",
        clothing: "steelArmor",
        weapon: "rapier",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 130,
        isVisitor: false,
      },
      {
        name: "sara",
        race: "human",
        blessing: "mind",
        clothing: "soldierUniform",
        weapon: "samuraiBow",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 100,
        isVisitor: false,
      },
      {
        name: "nick",
        race: "human",
        blessing: "mind",
        clothing: "redRobe",
        weapon: "rubyRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 120,
        isVisitor: false,
      },
      {
        name: "yoshua",
        race: "human",
        blessing: "mind",
        clothing: "blueRobe",
        weapon: "sapphireRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 110,
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
        blessing: "mind",
        clothing: "furArmor",
        weapon: "rapier",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 135,
        isVisitor: true,
      },
      {
        name: "jonny",
        race: "human",
        blessing: "mind",
        clothing: "soldierUniform",
        weapon: "samuraiBow",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 105,
        isVisitor: true,
      },
      {
        name: "noa",
        race: "human",
        blessing: "mind",
        clothing: "redRobe",
        weapon: "rubyRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 125,
        isVisitor: true,
      },
      {
        name: "funcy",
        race: "human",
        blessing: "mind",
        clothing: "greenRobe",
        weapon: "emeraldRod",
        statuses: [],
        hp: 100,
        mp: 0,
        restWt: 115,
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
          name: "sara",
          race: "human",
          blessing: "mind",
          clothing: "soldierUniform",
          weapon: "samuraiBow",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 100,
          isVisitor: false,
        },
        {
          name: "jonny",
          race: "human",
          blessing: "mind",
          clothing: "soldierUniform",
          weapon: "samuraiBow",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 105,
          isVisitor: true,
        },
        {
          name: "yoshua",
          race: "human",
          blessing: "mind",
          clothing: "blueRobe",
          weapon: "sapphireRod",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 110,
          isVisitor: false,
        },
        {
          name: "funcy",
          race: "human",
          blessing: "mind",
          clothing: "greenRobe",
          weapon: "emeraldRod",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 115,
          isVisitor: true,
        },
        {
          name: "nick",
          race: "human",
          blessing: "mind",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 120,
          isVisitor: false,
        },
        {
          name: "noa",
          race: "human",
          blessing: "mind",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 125,
          isVisitor: true,
        },
        {
          name: "sam",
          race: "human",
          blessing: "mind",
          clothing: "steelArmor",
          weapon: "rapier",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 130,
          isVisitor: false,
        },
        {
          name: "john",
          race: "human",
          blessing: "mind",
          clothing: "furArmor",
          weapon: "rapier",
          statuses: [],
          hp: 300,
          mp: 200,
          restWt: 135,
          isVisitor: true,
        },
      ],
      field: {
        climate: "SUNNY",
      },
    },
  ],
  result: GameOngoing,
} as BattleJson;

describe("Damage#rapier", function () {
  it("前衛刺突耐性なし", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[6]) as CharactorBattling; // sam
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[7]) as CharactorBattling; // john
    const skill = skillRepository.get("stab") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[6].name).toBe("john");
    expect(turn.sortedCharactors[6].hp).toBe(230);
    expect(turn.sortedCharactors[6].restWt).toBe(135);

    expect(turn.sortedCharactors[7].name).toBe("sam");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("前衛刺突耐性あり", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[7]) as CharactorBattling; // john
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[6]) as CharactorBattling; // sam
    const skill = skillRepository.get("stab") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[6].name).toBe("sam");
    expect(turn.sortedCharactors[6].hp).toBe(280);
    expect(turn.sortedCharactors[6].restWt).toBe(130);

    expect(turn.sortedCharactors[7].name).toBe("john");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("弓使い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[6]) as CharactorBattling; // sam
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[1]) as CharactorBattling; // jonny
    const skill = skillRepository.get("stab") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[1].name).toBe("jonny");
    expect(turn.sortedCharactors[1].hp).toBe(210);
    expect(turn.sortedCharactors[1].restWt).toBe(105);

    expect(turn.sortedCharactors[7].name).toBe("sam");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("魔法使い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[6]) as CharactorBattling; // sam
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[5]) as CharactorBattling; // noa
    const skill = skillRepository.get("stab") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[5].name).toBe("noa");
    expect(turn.sortedCharactors[5].hp).toBe(190);
    expect(turn.sortedCharactors[5].restWt).toBe(125);

    expect(turn.sortedCharactors[7].name).toBe("sam");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
});

describe("Damage#samuraiBow", function () {
  it("前衛刺突耐性なし", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[0]) as CharactorBattling; // sara
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[7]) as CharactorBattling; // john
    const skill = skillRepository.get("shot") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[6].name).toBe("john");
    expect(turn.sortedCharactors[6].hp).toBe(230);
    expect(turn.sortedCharactors[6].restWt).toBe(135);

    expect(turn.sortedCharactors[7].name).toBe("sara");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("前衛刺突耐性あり", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[0]) as CharactorBattling; // sara
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[6]) as CharactorBattling; // sam
    const skill = skillRepository.get("shot") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[5].name).toBe("sam");
    expect(turn.sortedCharactors[5].hp).toBe(280);
    expect(turn.sortedCharactors[5].restWt).toBe(130);

    expect(turn.sortedCharactors[7].name).toBe("sara");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("弓使い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[0]) as CharactorBattling; // sara
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[1]) as CharactorBattling; // jonny
    const skill = skillRepository.get("shot") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[0].name).toBe("jonny");
    expect(turn.sortedCharactors[0].hp).toBe(210);
    expect(turn.sortedCharactors[0].restWt).toBe(105);

    expect(turn.sortedCharactors[7].name).toBe("sara");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("魔法使い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[0]) as CharactorBattling; // sara
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[5]) as CharactorBattling; // noa
    const skill = skillRepository.get("shot") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[4].name).toBe("noa");
    expect(turn.sortedCharactors[4].hp).toBe(190);
    expect(turn.sortedCharactors[4].restWt).toBe(125);

    expect(turn.sortedCharactors[7].name).toBe("sara");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
});
describe("Damage#flameFall", function () {
  it("前衛", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[4]) as CharactorBattling; // nick
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[7]) as CharactorBattling; // john
    const skill = skillRepository.get("flameFall") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[6].name).toBe("john");
    expect(turn.sortedCharactors[6].hp).toBe(230);
    expect(turn.sortedCharactors[6].restWt).toBe(135);

    expect(turn.sortedCharactors[7].name).toBe("nick");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("弓使い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[4]) as CharactorBattling; // nick
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[1]) as CharactorBattling; // jonny
    const skill = skillRepository.get("flameFall") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[1].name).toBe("jonny");
    expect(turn.sortedCharactors[1].hp).toBe(210);
    expect(turn.sortedCharactors[1].restWt).toBe(105);

    expect(turn.sortedCharactors[7].name).toBe("nick");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("属性相性よい", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[4]) as CharactorBattling; // nick
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[3]) as CharactorBattling; // funcy
    const skill = skillRepository.get("flameFall") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[3].name).toBe("funcy");
    expect(turn.sortedCharactors[3].hp).toBe(154);
    expect(turn.sortedCharactors[3].restWt).toBe(115);

    expect(turn.sortedCharactors[7].name).toBe("nick");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("属性相性悪い", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[4]) as CharactorBattling; // nick
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[2]) as CharactorBattling; // yoshua
    const skill = skillRepository.get("flameFall") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[2].name).toBe("yoshua");
    expect(turn.sortedCharactors[2].hp).toBe(246);
    expect(turn.sortedCharactors[2].restWt).toBe(110);

    expect(turn.sortedCharactors[7].name).toBe("nick");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
  it("属性相性なし", function () {
    const battle = toBattle(testData) as Battle;
    const actor = toCharactorBattling(testData.turns[0].sortedCharactors[4]) as CharactorBattling; // nick
    const receiver = toCharactorBattling(testData.turns[0].sortedCharactors[5]) as CharactorBattling; // noa
    const skill = skillRepository.get("flameFall") as Skill;

    const turn = actToCharactor(battle, actor, skill, [receiver], new Date(), {
      times: 0.5,
      damage: 0.5,
      accuracy: 0.5,
    });

    expect(turn.sortedCharactors[4].name).toBe("noa");
    expect(turn.sortedCharactors[4].hp).toBe(200);
    expect(turn.sortedCharactors[4].restWt).toBe(125);

    expect(turn.sortedCharactors[7].name).toBe("nick");
    expect(turn.sortedCharactors[7].hp).toBe(300);
    expect(turn.sortedCharactors[7].restWt).toBe(230);
  });
});
