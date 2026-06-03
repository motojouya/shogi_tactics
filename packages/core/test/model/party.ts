import { describe, it, expect } from "vitest";

import type { Party } from "../../src/model/party";
import { CharactorDuplicationError } from "../../src/model/party";
import { toParty } from "../../src/store_schema/party";

describe("Party#toParty", function () {
  it("CharactorDuplicationError", function () {
    const party = toParty({
      name: "team01",
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
        },
        {
          name: "sam",
          race: "human",
          blessing: "earth",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 115,
        },
      ],
    }) as Party;
    expect(party instanceof CharactorDuplicationError).toBe(true);
    if (party instanceof CharactorDuplicationError) {
      expect(party.message).toBe("Partyに同じ名前のキャラクターが存在します");
    } else {
      expect.unreachable("party should be value");
    }
  });
  it("ok", function () {
    const party = toParty({
      name: "team01",
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
        },
        {
          name: "john",
          race: "human",
          blessing: "earth",
          clothing: "redRobe",
          weapon: "rubyRod",
          statuses: [],
          hp: 100,
          mp: 0,
          restWt: 115,
        },
      ],
    }) as Party;

    expect(party.name).toBe("team01");
    expect(party.charactors.length).toBe(2);
    expect(party.charactors[0].name).toBe("sam");
    expect(party.charactors[1].name).toBe("john");
  });
});
