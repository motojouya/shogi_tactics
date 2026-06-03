import type { Dialogue } from "../../../src/io/window_dialogue";
import type { PartyRepository } from "@motojouya/kniw-core/store/party";

import { describe, it, expect } from "vitest";
import { dismissParty } from "../../../src/procedure/party/dismiss";

const partyRepository: PartyRepository = {
  save: (_obj) => new Promise((resolve, _reject) => resolve()),
  get: (_name) => new Promise((resolve, _reject) => resolve(battle)),
  remove: (_name) => new Promise((resolve, _reject) => resolve()),
  list: () => new Promise((resolve, _reject) => resolve([])),
  importJson: (_fileName) => new Promise((resolve, _reject) => resolve(battle)),
  exportJson: (_obj, _fileName) => new Promise((resolve, _reject) => resolve(null)),
};

describe("dismissParty", () => {
  it("dismiss party", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      remove: async (name) => {
        expect(name).toBe("test");
      },
    };
    const dialogue: Dialogue = {
      confirm: () => true,
      notice: (_message) => {},
    };

    const result = await dismissParty(dialogue, mockRepo)("test");

    expect(result).toBe(true);
  });

  it("cancel", async () => {
    const mockRepo: PartyRepository = {
      ...partyRepository,
      remove: async () => {
        expect.unreachable();
      },
    };
    const dialogue: Dialogue = {
      confirm: () => false,
      notice: (_message) => {},
    };

    const result = await dismissParty(dialogue, mockRepo)("test");

    expect(result).toBe(false);
  });
});
