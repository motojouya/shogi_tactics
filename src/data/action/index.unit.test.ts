import { describe, it, expect } from "vitest";

import type { Action } from "../../model/action";
import * as actions from "./index";

const allActions = Object.values(actions) as Action[];

describe("data/action effectRange/reachRange", function () {
  it.each(allActions)("$key のeffectRangeは3×3で値は0か1", function (action) {
    expect(action.effectRange).toHaveLength(3);
    for (const row of action.effectRange) {
      expect(row).toHaveLength(3);
      for (const cell of row) {
        expect([0, 1]).toContain(cell);
      }
    }
  });

  it.each(allActions)("$key のreachRangeは7×7で値は0..3", function (action) {
    expect(action.reachRange).toHaveLength(7);
    for (const row of action.reachRange) {
      expect(row).toHaveLength(7);
      for (const cell of row) {
        expect([0, 1, 2, 3]).toContain(cell);
      }
    }
  });

  it.each(allActions)("$key のreachRangeはActorマス(bit1)をちょうど1つ持つ", function (action) {
    const actorCells = action.reachRange.flat().filter((cell) => (cell & 2) === 2);
    expect(actorCells).toHaveLength(1);
  });
});

describe("data/action 弓(arrowDodge対象)の分類", function () {
  // reachLength>=2は弓による攻撃としてarrowDodge(矢かわし)で無効化される(model/action.tsのRANGED_REACH_THRESHOLD)。
  // 槍(spearAttack/strongSpear)は2マス先まで届くが弓ではないためreachLength=1(届く距離はeffectLengthで表現)。
  const bowKeys = ["rangedAttack", "rangedSpread", "strongRanged", "piercingArrow"];

  it.each(allActions)("$key が矢かわし対象(reachLength>=2)なのは弓アクションのみ", function (action) {
    expect(action.reachLength >= 2).toBe(bowKeys.includes(action.key));
  });
});
