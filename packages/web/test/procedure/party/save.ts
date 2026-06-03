import type { PartyRepository } from "@motojouya/kniw-core/store/party";

import { DataExistError } from "@motojouya/kniw-core/store_utility/schema";
import { CharactorDuplicationError } from "@motojouya/kniw-core/model/party";

import { describe, it, expect } from "vitest";
import { saveParty } from "../../../src/procedure/party/save";

const partyRepository: PartyRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(battle)),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(battle)),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

const testData = {
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

describe("saveParty", () => {
  it("save party", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      save: async (_obj) => {},
      list: async () => ["home"],
    };

    const result = await saveParty(mockRepo, false)(testData);

    expect(result).toBe(null);
  });

  it("save party with checkExists", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      save: async (_obj) => {},
      list: async () => ["home"],
    };

    const result = await saveParty(mockRepo, true)(testData);

    expect(result).toBeInstanceOf(DataExistError);
  });

  it("charactor duplication", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      save: async (_obj) => {},
      list: async () => ["home"],
    };

    const result = await saveParty(
      mockRepo,
      true,
    )({
      ...testData,
      charactors: [testData.charactors[0], testData.charactors[0]],
    });

    expect(result).toBeInstanceOf(CharactorDuplicationError);
  });
});
