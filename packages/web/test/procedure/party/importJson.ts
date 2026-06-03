import type { Dialogue } from "../../io/window_dialogue";
import type { PartyRepository } from "@motojouya/kniw-core/store/party";

import { describe, it, expect } from "vitest";
import { CharactorDuplicationError } from "@motojouya/kniw-core/model/party";
import { UserCancel, EmptyParameter } from "../../../src/io/window_dialogue";
import { importParty } from "../../../src/procedure/party/importJson";
import { toParty } from "@motojouya/kniw-core/store_schema/party";

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

describe("importParty", () => {
  it("import party", async () => {
    const party = toParty(testData);
    const mockRepo: PartyRepository = {
      ...partyRepository,
      importJson: async (_fileName) => party,
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("message");
        return true;
      },
      notice: (_message) => {},
    };

    const result = await importParty(dialogue, mockRepo)("message");

    expect(result.name).toBe(party.name);
    expect(result.charactors.length).toBe(party.charactors.length);
  });

  it("cancel", async () => {
    const party = toParty(testData);
    const mockRepo: PartyRepository = {
      ...partyRepository,
      importJson: async () => party,
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("message");
        return false;
      },
      notice: (_message) => {},
    };

    const result = await importParty(dialogue, mockRepo)("message");

    expect(result).toBeInstanceOf(UserCancel);
  });

  it("empty party", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      importJson: async () => null,
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("message");
        return true;
      },
      notice: (_message) => {},
    };

    const result = await importParty(dialogue, mockRepo)("message");

    expect(result).toBeInstanceOf(EmptyParameter);
  });

  it("charactor duplication", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      importJson: async () => new CharactorDuplicationError("duplicatedName", "charactor duplicate!"),
    };
    const dialogue: Dialogue = {
      confirm: (message) => {
        expect(message).toBe("message");
        return true;
      },
      notice: (_message) => {},
    };

    const result = await importParty(dialogue, mockRepo)("message");

    expect(result).toBeInstanceOf(CharactorDuplicationError);
  });
});
