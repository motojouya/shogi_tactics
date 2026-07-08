import type { BattleRepository } from "../repository/battle";
import type { Repository } from "../repository";
import type { Battle } from "../model/battle";

import { describe, it, expect } from "vitest";

import { addUnit } from "./add_unit";
import { pieceRepository } from "../repository/piece";
import { createBattle, format } from "../model/battle";
import { InvalidArgumentError } from "../model/error";

// 空編成の先頭Turnを持つ戦乱モードbattle(unitCount=2)。
const emptyBattle = (): Battle =>
  format(createBattle("key", "first", "second", 4, 2, "v1"), [], new Date("2023-06-29T12:12:21"));

const buildRepository = (saved: Battle[]): Repository => {
  const battleRepository: BattleRepository = {
    save: async (battle) => {
      saved.push(battle);
    },
    get: async () => null,
    remove: async () => {},
    list: async () => [],
    importJson: async () => null,
    exportJson: async () => null,
  };
  return { battle: battleRepository, piece: pieceRepository } as unknown as Repository;
};

// addUnitはBattle | InvalidArgumentErrorを返す。成功を前提とするステップ向けにBattleへ絞り込む。
const mustAdd = async (result: Promise<Battle | InvalidArgumentError>): Promise<Battle> => {
  const battle = await result;
  if (battle instanceof InvalidArgumentError) {
    throw battle;
  }
  return battle;
};

describe("addUnit", () => {
  it("rosterに駒を追加して保存する", async () => {
    const saved: Battle[] = [];
    const result = await mustAdd(
      addUnit(buildRepository(saved))(emptyBattle(), "FIRST", { piece: "king", leader: true }),
    );

    expect(result.turns[0].units.length).toBe(1);
    const unit = result.turns[0].units[0];
    expect(unit.side).toBe("FIRST");
    expect(unit.piece).toBe("king");
    expect(unit.leader).toBe(true);
    expect(saved.length).toBe(1);
  });

  it("同じ陣営に同じ駒は追加できない(エラーを返し保存しない)", async () => {
    const saved: Battle[] = [];
    const repository = buildRepository(saved);
    const one = await mustAdd(addUnit(repository)(emptyBattle(), "FIRST", { piece: "king", leader: true }));
    const two = await mustAdd(addUnit(repository)(one, "SECOND", { piece: "king", leader: true }));
    saved.length = 0;
    const result = await addUnit(repository)(two, "FIRST", { piece: "king", leader: false });

    expect(result).toBeInstanceOf(InvalidArgumentError);
    expect(saved.length).toBe(0);
  });

  it("手番でない陣営には追加できない(エラーを返し保存しない)", async () => {
    const saved: Battle[] = [];
    const repository = buildRepository(saved);
    const one = await mustAdd(addUnit(repository)(emptyBattle(), "FIRST", { piece: "king", leader: true }));
    saved.length = 0;
    const result = await addUnit(repository)(one, "FIRST", { piece: "rook", leader: false });

    expect(result).toBeInstanceOf(InvalidArgumentError);
    expect(saved.length).toBe(0);
  });

  it("既にleaderが居る陣営ではleader指定は無効化される", async () => {
    const saved: Battle[] = [];
    const repository = buildRepository(saved);
    const one = await mustAdd(addUnit(repository)(emptyBattle(), "FIRST", { piece: "king", leader: true }));
    const two = await mustAdd(addUnit(repository)(one, "SECOND", { piece: "king", leader: true }));
    const three = await mustAdd(addUnit(repository)(two, "FIRST", { piece: "rook", leader: true }));

    expect(three.turns[0].units[2].leader).toBe(false);
  });
});
