import { describe, it, expect } from "vitest";

import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";
import type { DoActionForm } from "../form/action";

import { createBattle, getLastTurn } from "../model/battle";
import { start, ORDER_DO_NOTHING } from "../model/turn";
import { act } from "./act";
import { actionRepository } from "../repository/action";
import { pieceRepository } from "../repository/piece";
import { statusRepository } from "../repository/status";
import { DataNotFoundError, UserCancel } from "../model/error";

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

const local = (confirm: boolean): Local => ({
  confirm: () => confirm,
  notice: () => {},
  getUuid: () => "key",
  now: () => new Date("2024-01-01T00:00:00"),
  transit: () => {},
  getSearchParams: () => new URLSearchParams(),
});

// S16: actはRepositoryを丸ごと受け取る。内部でcreateResolversがpiece/action/statusのgetを束ねる。
const repository = (confirm: boolean) =>
  ({
    battle: battleRepository,
    local: local(confirm),
    action: actionRepository,
    piece: pieceRepository,
    status: statusRepository,
  }) as unknown as Repository;

const actor = { side: "FIRST", piece: "king" } as const;

describe("act", () => {
  it("act", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "meleeAttack", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(repository(true))(battle, actor, form);

    if (result instanceof DataNotFoundError || result instanceof UserCancel || "message" in result) {
      expect.unreachable("act should succeed");
    } else {
      expect(getLastTurn(result).order.type).toBe("DO_ACTION");
    }
  });

  it("対象を選ばなくても実行できる(コストのみ加算、対象は変化しない)", async () => {
    const battle = makeBattle();
    // 受け手はすべて未選択(空value)。toReceiversで除外され受け手0で実行される。
    const form: DoActionForm = { actionKey: "meleeAttack", receivers: [{ value: "" }, {}] };

    const result = await act(repository(true))(battle, actor, form);

    if (result instanceof DataNotFoundError || result instanceof UserCancel || "message" in result) {
      expect.unreachable("act should succeed without receivers");
    } else {
      const lastTurn = getLastTurn(result);
      expect(lastTurn.order.type).toBe("DO_ACTION");
      // 受け手未選択なので対象(pawn)のHPは変化しない。
      const pawn = lastTurn.units.find((unit) => unit.side === "SECOND" && unit.piece === "pawn");
      expect(pawn?.hp).toBe(3);
    }
  });

  it("何もしない(ORDER_DO_NOTHING)は確認後に保存される", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: ORDER_DO_NOTHING, receivers: [] };

    const result = await act(repository(true))(battle, actor, form);

    if (result instanceof DataNotFoundError || result instanceof UserCancel || "message" in result) {
      expect.unreachable("doNothing should succeed");
    } else {
      expect(getLastTurn(result).order.type).toBe("DO_NOTHING");
    }
  });

  it("何もしない(ORDER_DO_NOTHING)でcancelするとUserCancelを返す", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: ORDER_DO_NOTHING, receivers: [] };

    const result = await act(repository(false))(battle, actor, form);
    expect(result instanceof UserCancel).toBe(true);
  });

  it("data not found", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "noSuchAction", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(repository(true))(battle, actor, form);
    expect(result instanceof DataNotFoundError).toBe(true);
  });

  it("cancel", async () => {
    const battle = makeBattle();
    const form: DoActionForm = { actionKey: "meleeAttack", receivers: [{ value: "SECOND:pawn" }] };

    const result = await act(repository(false))(battle, actor, form);
    expect(result instanceof UserCancel).toBe(true);
  });
});
