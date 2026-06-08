import type { Party, PartyBattling } from "./party";
import type { CharactorBattling } from "./charactor";
import type { Skill } from "./skill";
import type { Randoms } from "./random";
import type { Turn } from "./turn";

import { MAGIC_TYPE_NONE } from "./skill";
import { copyPartyBattling } from "./party";
import { getPhysical, getAbilities, toBattleCharactor, copyCharactorBattling } from "./charactor";
import { changeClimate } from "./field";
import { copyTurn } from "./turn";

import { acid, paralysis, quick, silent, sleep, slow } from "../store_data/status/index";
import { underStatus } from "./status";

const arrayLast = <T>(ary: Array<T>): T => ary.slice(-1)[0];

export type GameResult = "ONGOING" | "HOME" | "VISITOR" | "DRAW";
export const GameOngoing: GameResult = "ONGOING";
export const GameHome: GameResult = "HOME";
export const GameVisitor: GameResult = "VISITOR";
export const GameDraw: GameResult = "DRAW";

export type Battle = {
  title: string;
  home: PartyBattling;
  visitor: PartyBattling;
  turns: Turn[];
  result: GameResult;
};

export type CopyBattle = (battle: Battle) => Battle;
export const copyBattle: CopyBattle = (battle) => ({
  title: battle.title,
  home: copyPartyBattling(battle.home),
  visitor: copyPartyBattling(battle.visitor),
  turns: battle.turns.map(copyTurn),
  result: battle.result,
});

export type GetLastTurn = (battle: Battle) => Turn;
export const getLastTurn: GetLastTurn = (battle) => arrayLast(battle.turns);

export type NextActor = (battle: Battle) => CharactorBattling;
export const nextActor: NextActor = (battle) => arrayLast(battle.turns).sortedCharactors[0];
export type TurnActor = (turn: Turn) => CharactorBattling;
export const turnActor: TurnActor = (turn) => turn.sortedCharactors[0];

type SortByWT = (charactors: CharactorBattling[]) => CharactorBattling[];
const sortByWT: SortByWT = (charactors) =>
  charactors
    .filter((charactor) => charactor.hp > 0)
    .sort((left, right) => {
      const leftPhysical = getPhysical(left);
      const rightPhysical = getPhysical(right);
      const wtDiff = left.restWt - right.restWt;
      if (wtDiff !== 0) {
        return wtDiff;
      }
      const agiDiff = leftPhysical.AGI - rightPhysical.AGI;
      if (agiDiff !== 0) {
        return agiDiff;
      }
      const avdDiff = leftPhysical.AVD - rightPhysical.AVD;
      if (avdDiff !== 0) {
        return avdDiff;
      }
      const hpDiff = left.hp - right.hp;
      if (hpDiff !== 0) {
        return hpDiff;
      }
      const mpDiff = left.mp - right.mp;
      if (mpDiff !== 0) {
        return mpDiff;
      }
      const statusDiff = left.statuses.length - right.statuses.length;
      if (statusDiff !== 0) {
        return statusDiff;
      }
      // FIXME 最終的に元の並び順という感じだが、これで嫌な挙動した際は対策が必要
      // battleごとにseedを決定しつつ、CharactorBattlingをhash値になおして比較がいいんじゃないかな。
      return 0;
    });

export type CreateBattle = (title: string, home: Party, visitor: Party) => Battle;
export const createBattle: CreateBattle = (title, home, visitor) => {
  const homeBatting: PartyBattling = {
    name: home.name,
    charactors: home.charactors.map((charactor) => toBattleCharactor(charactor, false)),
  };
  const visitorBatting: PartyBattling = {
    name: visitor.name,
    charactors: visitor.charactors.map((charactor) => toBattleCharactor(charactor, true)),
  };
  return {
    title,
    home: homeBatting,
    visitor: visitorBatting,
    turns: [],
    result: GameOngoing,
  };
};

export type Start = (battle: Battle, datetime: Date, randoms: Randoms) => Turn;
export const start: Start = (battle, datetime, randoms) => ({
  datetime,
  action: {
    type: "TIME_PASSING",
    wt: 0,
  },
  sortedCharactors: sortByWT([
    ...battle.home.charactors.map(copyCharactorBattling),
    ...battle.visitor.charactors.map(copyCharactorBattling),
  ]),
  field: {
    climate: changeClimate(randoms),
  },
  randoms,
});

export type Stay = (battle: Battle, actor: CharactorBattling, datetime: Date, randoms: Randoms) => Turn;
export const stay: Stay = (battle, actor, datetime, randoms) => {
  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "DO_NOTHING",
      actor,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    field: lastTurn.field,
    randoms,
  };

  newTurn.sortedCharactors = newTurn.sortedCharactors.map((charactor) => {
    const newCharactor = {
      ...charactor,
      statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
    };
    if (actor.isVisitor === charactor.isVisitor && actor.name === charactor.name) {
      newCharactor.restWt = getPhysical(charactor).WT;
    }
    return newCharactor;
  });
  newTurn.sortedCharactors = sortByWT(newTurn.sortedCharactors);

  return newTurn;
};

type UpdateCharactor = (receivers: CharactorBattling[]) => (charactor: CharactorBattling) => CharactorBattling;
const updateCharactor: UpdateCharactor = (receivers) => (charactor) => {
  const foundReceiver = receivers.find((receiver) => charactor.name === receiver.name);
  if (foundReceiver) {
    return foundReceiver;
  }
  return charactor;
};

export type ActToCharactor = (
  battle: Battle,
  actor: CharactorBattling,
  skill: Skill,
  receivers: CharactorBattling[],
  datetime: Date,
  randoms: Randoms,
) => Turn;
export const actToCharactor: ActToCharactor = (battle, actor, skill, receivers, datetime, randoms) => {
  if (skill.type === "SKILL_TO_FIELD") {
    throw new Error("invalid skill type");
  }

  if (skill.mpConsumption > actor.mp) {
    throw new Error("mp shortage");
  }

  if (underStatus(silent, actor) && skill.magicType !== MAGIC_TYPE_NONE) {
    throw new Error("silent cannot do magic");
  }

  if (underStatus(sleep, actor)) {
    return stay(battle, actor, datetime, randoms);
  }

  // FIXME 動けなかった際に麻痺が理由とかそういうのわかるとよい
  if (underStatus(paralysis, actor) && randoms.accuracy > 0.5) {
    return stay(battle, actor, datetime, randoms);
  }

  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "DO_SKILL",
      actor,
      skill,
      receivers,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    field: lastTurn.field,
    randoms,
  };

  const resultReceivers = receivers.map((receiver) => skill.action(skill, actor, randoms, lastTurn.field, receiver));
  newTurn.sortedCharactors = newTurn.sortedCharactors
    .map(updateCharactor(resultReceivers))
    .filter((charactor) => charactor.hp > 0);

  newTurn.sortedCharactors = newTurn.sortedCharactors.map((charactor) => {
    const newCharactor = {
      ...charactor,
      statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
    };
    if (actor.isVisitor === charactor.isVisitor && actor.name === charactor.name) {
      newCharactor.restWt = getPhysical(charactor).WT + skill.additionalWt;
      newCharactor.mp -= skill.mpConsumption;
    }
    return newCharactor;
  });
  newTurn.sortedCharactors = sortByWT(newTurn.sortedCharactors);

  return newTurn;
};

export type ActToField = (
  battle: Battle,
  actor: CharactorBattling,
  skill: Skill,
  datetime: Date,
  randoms: Randoms,
) => Turn;
export const actToField: ActToField = (battle, actor, skill, datetime, randoms) => {
  if (skill.type === "SKILL_TO_CHARACTOR") {
    throw new Error("invalid skill type");
  }

  if (skill.mpConsumption > actor.mp) {
    throw new Error("mp shortage");
  }

  if (underStatus(silent, actor) && skill.magicType !== MAGIC_TYPE_NONE) {
    throw new Error("silent cannot do magic");
  }

  if (underStatus(sleep, actor)) {
    return stay(battle, actor, datetime, randoms);
  }

  // FIXME 動けなかった際に麻痺が理由とかそういうのわかるとよい
  if (underStatus(paralysis, actor) && randoms.accuracy > 0.5) {
    return stay(battle, actor, datetime, randoms);
  }

  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "DO_SKILL",
      actor,
      skill,
      receivers: [],
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    field: lastTurn.field,
    randoms,
  };

  newTurn.field = skill.action(skill, actor, randoms, lastTurn.field);

  newTurn.sortedCharactors = newTurn.sortedCharactors.map((charactor) => {
    const newCharactor = {
      ...charactor,
      statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
    };
    if (actor.isVisitor === charactor.isVisitor && actor.name === charactor.name) {
      newCharactor.restWt = getPhysical(charactor).WT + skill.additionalWt;
      newCharactor.mp -= skill.mpConsumption;
    }
    return newCharactor;
  });
  newTurn.sortedCharactors = sortByWT(newTurn.sortedCharactors);

  return newTurn;
};

export type Surrender = (battle: Battle, actor: CharactorBattling, datetime: Date, randoms: Randoms) => Turn;
export const surrender: Surrender = (battle, actor, datetime, randoms) => {
  const lastTurn = arrayLast(battle.turns);
  return {
    datetime,
    action: {
      type: "SURRENDER",
      actor,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    field: lastTurn.field,
    randoms,
  };
};

type WaitCharactor = (charactor: CharactorBattling, wt: number, randoms: Randoms) => CharactorBattling;
const waitCharactor: WaitCharactor = (charactor, wt, randoms) => {
  const abilities = getAbilities(charactor);

  const newCharactor = abilities.reduce((charactorAc, ability) => ability.wait(wt, charactorAc, randoms), {
    ...charactor,
    statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  } as CharactorBattling);

  // prettier-ignore
  const wtRate = underStatus(quick, newCharactor) ? 1.5
    : underStatus(slow, newCharactor) ? 0.75
    : 1;

  newCharactor.restWt = Math.max(newCharactor.restWt - wt * wtRate, 0);

  if (underStatus(acid, newCharactor)) {
    newCharactor.hp = Math.max(newCharactor.hp - wt / 10, 0);
  }

  newCharactor.statuses = newCharactor.statuses
    .map((attachedStatus) => {
      const restWt = attachedStatus.restWt - wt;
      return {
        ...attachedStatus,
        restWt,
      };
    })
    .filter((attachedStatus) => attachedStatus.restWt > 0);

  const physical = getPhysical(newCharactor);
  newCharactor.mp = Math.min(newCharactor.mp + Math.floor(wt / 10), physical.MaxMP);

  return newCharactor;
};

export type Wait = (battle: Battle, wt: number, datetime: Date, randoms: Randoms) => Turn;
export const wait: Wait = (battle, wt, datetime, randoms) => {
  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "TIME_PASSING",
      wt,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    field: {
      climate: changeClimate(randoms),
    },
    randoms,
  };
  newTurn.sortedCharactors = newTurn.sortedCharactors.map((charactor) => waitCharactor(charactor, wt, randoms));

  return newTurn;
};

export type IsSettlement = (battle: Battle) => GameResult;
export const isSettlement: IsSettlement = (battle) => {
  const lastestTurn = arrayLast(battle.turns);
  if (lastestTurn.action.type === "SURRENDER") {
    if (lastestTurn.action.actor.isVisitor) {
      return GameHome;
    } else {
      return GameVisitor;
    }
  }

  const homeCharactors = lastestTurn.sortedCharactors.filter((charactor) => !charactor.isVisitor && charactor.hp);
  const visitorCharactors = lastestTurn.sortedCharactors.filter((charactor) => charactor.isVisitor && charactor.hp);

  if (homeCharactors.length === 0 && visitorCharactors.length === 0) {
    return GameDraw;
  }
  if (homeCharactors.length > 0 && visitorCharactors.length === 0) {
    return GameHome;
  }
  if (homeCharactors.length === 0 && visitorCharactors.length > 0) {
    return GameVisitor;
  }
  return GameOngoing;
};

// TODO battleを引き回して更新しているので、同じ名前空間に前後のbattleがあっても値が同じになってしまう。
// web procedure/act関数のtestが通ってしまっているが、実態として正しいテストになってない。
// spendTurnに限らず、この問題はありそう。
export type Action = {
  skill: Skill;
  receivers: CharactorBattling[];
};
export type SpendTurn = (
  battle: Battle,
  actor: CharactorBattling,
  action: Action | null,
  getDatetime: () => Date,
  getRandoms: () => Randoms,
) => Battle;
export const spendTurn: SpendTurn = (battle, actor, action, getDatetime, getRandoms) => {
  const newBattle = copyBattle(battle);

  if (action === null) {
    newBattle.turns.push(stay(newBattle, actor, getDatetime(), getRandoms()));
  } else {
    const selectedSkill = action.skill;
    const newTurn =
      selectedSkill.type === "SKILL_TO_FIELD"
        ? actToField(newBattle, actor, selectedSkill, getDatetime(), getRandoms())
        : actToCharactor(newBattle, actor, selectedSkill, action.receivers, getDatetime(), getRandoms());
    newBattle.turns.push(newTurn);
  }

  newBattle.result = isSettlement(newBattle);
  if (newBattle.result !== GameOngoing) {
    return newBattle;
  }

  let firstWaiting = nextActor(newBattle);
  newBattle.turns.push(wait(newBattle, firstWaiting.restWt, getDatetime(), getRandoms()));

  newBattle.result = isSettlement(newBattle);
  if (newBattle.result !== GameOngoing) {
    return newBattle;
  }

  while (underStatus(sleep, firstWaiting)) {
    newBattle.turns.push(stay(newBattle, firstWaiting, getDatetime(), getRandoms()));
    newBattle.result = isSettlement(newBattle);
    if (newBattle.result !== GameOngoing) {
      return newBattle;
    }

    firstWaiting = nextActor(newBattle);
    newBattle.turns.push(wait(newBattle, firstWaiting.restWt, getDatetime(), getRandoms()));
    newBattle.result = isSettlement(newBattle);
    if (newBattle.result !== GameOngoing) {
      return newBattle;
    }
  }

  return newBattle;
};
