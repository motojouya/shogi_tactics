import { describe, it, expect } from "vitest";

import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";
import type { Battle } from "../../model/battle";
import type { DoActionForm } from "../../form/battle";

import { createBattle, start, getLastTurn } from "../../model/battle";
import { act } from "./act";
import { DataNotFoundError } from "../../store_utility/schema";
import { UserCancel } from "../../io/window_dialogue";

const makeBattle = (): Battle => {
  const battle = createBattle("key", "first", "second", 2, 2, "v1");
  battle.turns.push(
    start(
      [
        { side: "FIRST", piece: "king", hp: 2, steps: 0, statuses: [], leader: true },
        { side: "SECOND", piece: "pawn", hp: 3, steps: 0, statuses: [], leader: true },
      ],
      new Date("2024-01-01T00:00:00"),
    ),
  );
  return battle;
};

const battleRepository: BattleRepository = {
  save: async () => {},
  get: async () => null,
  remove: async () => {},
  list: async () => [],
  importJson: async () => null,
  exportJson: async () => null,
};

const dialogue = (confirm: boolean): Dialogue => ({
  confirm: () => confirm,
  notice: () => {},
  getUuid: () => "key",
  now: () => new Date("2024-01-01T00:00:00"),
});

const actor = { side: "FIRST", piece: "king" } as const;

describe("act", () => {
  it("act", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "meleeAttack", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(dialogue(true), battleRepository)(
      battle,
      actor,
      form,
      () => new Date("2024-01-01T00:00:00"),
    );

    if (result instanceof DataNotFoundError || result instanceof UserCancel || "message" in result) {
      expect.unreachable("act should succeed");
    } else {
      expect(getLastTurn(result).order.type).toBe("DO_SKILL");
    }
  });

  it("data not found", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "noSuchAction", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(dialogue(true), battleRepository)(
      battle,
      actor,
      form,
      () => new Date("2024-01-01T00:00:00"),
    );
    expect(result instanceof DataNotFoundError).toBe(true);
  });

  it("cancel", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "meleeAttack", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(dialogue(false), battleRepository)(
      battle,
      actor,
      form,
      () => new Date("2024-01-01T00:00:00"),
    );
    expect(result instanceof UserCancel).toBe(true);
  });
});
