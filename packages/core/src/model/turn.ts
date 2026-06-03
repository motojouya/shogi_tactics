import type { Field } from "./field";
import type { CharactorBattling } from "./charactor";
import type { Skill } from "./skill";
import type { Randoms } from "./random";

import { copyCharactorBattling } from "./charactor";
import { copyRandoms } from "./random";

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

export type Action = TimePassing | DoNothing | DoSkill | Surrender;

export type Turn = {
  datetime: Date;
  action: Action;
  sortedCharactors: CharactorBattling[];
  field: Field;
  randoms: Randoms;
};

export type CopyAction = (action: Action) => Action;
export const copyAction: CopyAction = (action) => {
  if (action.type === "DO_SKILL") {
    return {
      type: action.type,
      actor: copyCharactorBattling(action.actor),
      skill: action.skill,
      receivers: action.receivers.map(copyCharactorBattling),
    };
  }
  if (action.type === "DO_NOTHING") {
    return {
      type: action.type,
      actor: copyCharactorBattling(action.actor),
    };
  }
  if (action.type === "SURRENDER") {
    return {
      type: action.type,
      actor: copyCharactorBattling(action.actor),
    };
  }
  return {
    type: action.type,
    wt: action.wt,
  };
};

export type CopyTurn = (turn: Turn) => Turn;
export const copyTurn: CopyTurn = (turn) => ({
  datetime: new Date(turn.datetime.getTime()),
  action: copyAction(turn.action),
  sortedCharactors: turn.sortedCharactors.map(copyCharactorBattling),
  field: turn.field,
  randoms: copyRandoms(turn.randoms),
});
