import { describe, it, expect } from "vitest";

import type { Party } from "../../src/model/party";
import type { Database } from "../../src/io/database";
import { toParty } from "../../src/store_schema/party";
import { createRepository } from "../../src/store/party";

const dbMock: Database = {
  save: (_namespace, _objctKey, _obj) => new Promise((resolve, _reject) => resolve()),
  get: (_namespace, _objctKey) =>
    new Promise((resolve, _reject) =>
      resolve({
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
      }),
    ),
  remove: (_namespace, _objctKey) => new Promise((resolve, _reject) => resolve()),
  list: (_namespace) => new Promise((resolve, _reject) => resolve(["team01", "team02"])),
  checkNamespace: (_namespace) => new Promise((resolve, _reject) => resolve()),
  importJson: (_fileName) =>
    new Promise((resolve, _reject) =>
      resolve({
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
      }),
    ),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

describe("Party#createRepository", function () {
  it("save", async () => {
    const repository = await createRepository(dbMock);
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
    await repository.save(party);
    expect(true).toBe(true);
  });
  it("get", async () => {
    const repository = await createRepository(dbMock);
    const party = await repository.get("team01");
    const typedParty = party as Party;
    if (typedParty) {
      expect(typedParty.name).toBe("team01");
      const charactors = typedParty.charactors;
      expect(charactors.length).toBe(2);
      expect(charactors[0].name).toBe("sam");
      expect(charactors[0].race.name).toBe("human");
      expect(charactors[0].blessing.name).toBe("earth");
      expect(charactors[0].clothing.name).toBe("steelArmor");
      expect(charactors[0].weapon.name).toBe("swordAndShield");
      expect(charactors[1].name).toBe("john");
      expect(charactors[1].race.name).toBe("human");
      expect(charactors[1].blessing.name).toBe("earth");
      expect(charactors[1].clothing.name).toBe("redRobe");
      expect(charactors[1].weapon.name).toBe("rubyRod");
    } else {
      expect.unreachable("party shoud be exist");
    }
  });
  it("remove", async () => {
    const repository = await createRepository(dbMock);
    await repository.remove("team01");
    expect(true).toBe(true);
  });
  it("list", async () => {
    const repository = await createRepository(dbMock);
    const partyList = await repository.list();
    expect(partyList.length).toBe(2);
    expect(partyList[0]).toBe("team01");
    expect(partyList[1]).toBe("team02");
  });
});
