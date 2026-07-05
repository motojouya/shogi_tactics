import type { BattleRepository } from "../repository/battle";
import type { Local } from "../repository/local";
import type { Repository } from "../repository";

import { describe, it, expect } from "vitest";

import { removeBattle } from "./remove";

const baseLocal: Local = {
  confirm: () => true,
  notice: () => {},
  getUuid: () => "0191e000-0000-7000-8000-000000000000",
  now: () => new Date("2023-06-29T12:12:21"),
  transit: () => {},
  getSearchParams: () => new URLSearchParams(),
};

const buildRepository = (battleRepository: BattleRepository, local: Local): Repository =>
  ({ battle: battleRepository, local }) as unknown as Repository;

const trackingRepository = (removed: string[]): BattleRepository => ({
  save: async () => {},
  get: async () => null,
  remove: async (key) => {
    removed.push(key);
  },
  list: async () => [],
  importJson: async () => null,
  exportJson: async () => null,
});

describe("removeBattle", () => {
  it("確認OKなら削除する", async () => {
    const removed: string[] = [];
    await removeBattle(buildRepository(trackingRepository(removed), { ...baseLocal, confirm: () => true }))("a");
    expect(removed).toEqual(["a"]);
  });

  it("確認キャンセルなら削除しない", async () => {
    const removed: string[] = [];
    await removeBattle(buildRepository(trackingRepository(removed), { ...baseLocal, confirm: () => false }))("a");
    expect(removed).toEqual([]);
  });
});
