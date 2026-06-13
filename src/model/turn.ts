import type { CharactorBattling } from "./charactor";
import type { Skill } from "./skill";

import { copyCharactorBattling } from "./charactor";

export const ACTION_DO_NOTHING = "DO_NOTHING";

export type DoSkill = {
  type: "DO_SKILL";
  actor: CharactorBattling;
  skill: Skill;
  receivers: CharactorBattling[];
};

export type DoNothing = {
  type: "DO_NOTHING";
  actor: CharactorBattling;
};

export type Surrender = {
  type: "SURRENDER";
  actor: CharactorBattling;
};

export type TimePassing = {
  type: "TIME_PASSING";
  wt: number;
};

export type Order = TimePassing | DoNothing | DoSkill | Surrender;

export type Turn = {
  datetime: Date;
  action: Order;
  sortedCharactors: CharactorBattling[];
};

export type CopyOrder = (order: Order) => Order;
export const copyOrder: CopyOrder = (order) => {
  if (order.type === "DO_SKILL") {
    return {
      type: order.type,
      actor: copyCharactorBattling(order.actor),
      skill: order.skill,
      receivers: order.receivers.map(copyCharactorBattling),
    };
  }
  if (order.type === "DO_NOTHING") {
    return {
      type: order.type,
      actor: copyCharactorBattling(order.actor),
    };
  }
  if (order.type === "SURRENDER") {
    return {
      type: order.type,
      actor: copyCharactorBattling(order.actor),
    };
  }
  return {
    type: order.type,
    wt: order.wt,
  };
};

export type CopyTurn = (turn: Turn) => Turn;
export const copyTurn: CopyTurn = (turn) => ({
  datetime: new Date(turn.datetime.getTime()),
  action: copyOrder(turn.action),
  sortedCharactors: turn.sortedCharactors.map(copyCharactorBattling),
});
