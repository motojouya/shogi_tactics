import type { CharactorBattling } from "./charactor";
import type { Skill } from "./skill";
import type { Turn } from "./turn";
import type { Unit } from "./unit";

import { getPhysical, copyCharactorBattling } from "./charactor";
import { copyTurn } from "./turn";

import { acid, quick, sleep, slow } from "../store_data/status/index";
import { underStatus } from "./charactor_status";

const arrayLast = <T>(ary: Array<T>): T => ary.slice(-1)[0];

export type GameResult = "ONGOING" | "HOME" | "VISITOR" | "DRAW";
export const GameOngoing: GameResult = "ONGOING";
export const GameHome: GameResult = "HOME";
export const GameVisitor: GameResult = "VISITOR";
export const GameDraw: GameResult = "DRAW";

// step6: home/visitor(PartyBattling)を廃止。ロスターは先頭Turnのunitsが持つ(types.md準拠)。
export type Battle = {
  turns: Turn[]; // turns.length===0は編成段階。先頭Turn.unitsがロスター
  result: GameResult;
  // types.md準拠のbattle基礎項目(step5で供給)
  key: string; // uuid v7。画面に表示されないkey(provider経由で供給)
  first_player_name: string;
  second_player_name: string;
  stepBase: number; // 順番ポイントのBASE(=開始時の総駒数)。1以上
  unitCount: number;
  version: string;
};

export type CopyBattle = (battle: Battle) => Battle;
export const copyBattle: CopyBattle = (battle) => ({
  turns: battle.turns.map(copyTurn),
  result: battle.result,
  key: battle.key,
  first_player_name: battle.first_player_name,
  second_player_name: battle.second_player_name,
  stepBase: battle.stepBase,
  unitCount: battle.unitCount,
  version: battle.version,
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
      const wtDiff = left.restWt - right.restWt;
      if (wtDiff !== 0) {
        return wtDiff;
      }
      const hpDiff = left.hp - right.hp;
      if (hpDiff !== 0) {
        return hpDiff;
      }
      const statusDiff = left.statuses.length - right.statuses.length;
      if (statusDiff !== 0) {
        return statusDiff;
      }
      // FIXME 最終的に元の並び順という感じだが、これで嫌な挙動した際は対策が必要
      // battleごとにseedを決定しつつ、CharactorBattlingをhash値になおして比較がいいんじゃないかな。
      return 0;
    });

// keyはuuid(provider経由)、player名/stepBase/unitCount/versionは登録フォームから受け取る。
// step6: home/visitorは廃止。createBattleはbattle骨格(turns=[])のみ生成し、ロスターはstart()でunitsとして積む。
// unitCountはparty駒数との整合を取らず入力値をそのまま採用する。
export type CreateBattle = (
  key: string,
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
  version: string,
) => Battle;
export const createBattle: CreateBattle = (key, firstPlayerName, secondPlayerName, stepBase, unitCount, version) => ({
  turns: [],
  result: GameOngoing,
  key,
  first_player_name: firstPlayerName,
  second_player_name: secondPlayerName,
  // stepBaseは1以上が必須。未指定/不正時はunitCountの2倍(最低1)にフォールバック
  stepBase: stepBase >= 1 ? stepBase : Math.max(unitCount * 2, 1),
  unitCount,
  version,
});

// step6: 先頭Turnを編成済みunitsから生成する。
// NOTE: sortedCharactors/WTエンジンはstep7まで残置のため空シード。units消費の順序エンジン化はstep7。
export type Start = (units: Unit[], datetime: Date) => Turn;
export const start: Start = (units, datetime) => ({
  datetime,
  action: {
    type: "TIME_PASSING",
    wt: 0,
  },
  sortedCharactors: [],
  units: units.map(copyUnit),
});

export type Stay = (battle: Battle, actor: CharactorBattling, datetime: Date) => Turn;
export const stay: Stay = (battle, actor, datetime) => {
  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "DO_NOTHING",
      actor,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    units: [],
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
) => Turn;
export const actToCharactor: ActToCharactor = (battle, actor, skill, receivers, datetime) => {
  if (underStatus(sleep, actor)) {
    return stay(battle, actor, datetime);
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
    units: [],
  };

  const resultReceivers = receivers.map((receiver) => skill.action(skill, actor, receiver));
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
    }
    return newCharactor;
  });
  newTurn.sortedCharactors = sortByWT(newTurn.sortedCharactors);

  return newTurn;
};

export type Surrender = (battle: Battle, actor: CharactorBattling, datetime: Date) => Turn;
export const surrender: Surrender = (battle, actor, datetime) => {
  const lastTurn = arrayLast(battle.turns);
  return {
    datetime,
    action: {
      type: "SURRENDER",
      actor,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    units: [],
  };
};

type WaitCharactor = (charactor: CharactorBattling, wt: number) => CharactorBattling;
const waitCharactor: WaitCharactor = (charactor, wt) => {
  const newCharactor: CharactorBattling = {
    ...charactor,
    statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  };

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

  return newCharactor;
};

export type Wait = (battle: Battle, wt: number, datetime: Date) => Turn;
export const wait: Wait = (battle, wt, datetime) => {
  const lastTurn = arrayLast(battle.turns);
  const newTurn: Turn = {
    datetime,
    action: {
      type: "TIME_PASSING",
      wt,
    },
    sortedCharactors: lastTurn.sortedCharactors.map(copyCharactorBattling),
    units: [],
  };
  newTurn.sortedCharactors = newTurn.sortedCharactors.map((charactor) => waitCharactor(charactor, wt));

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
) => Battle;
export const spendTurn: SpendTurn = (battle, actor, action, getDatetime) => {
  const newBattle = copyBattle(battle);

  if (action === null) {
    newBattle.turns.push(stay(newBattle, actor, getDatetime()));
  } else {
    const selectedSkill = action.skill;
    const newTurn = actToCharactor(newBattle, actor, selectedSkill, action.receivers, getDatetime());
    newBattle.turns.push(newTurn);
  }

  newBattle.result = isSettlement(newBattle);
  if (newBattle.result !== GameOngoing) {
    return newBattle;
  }

  let firstWaiting = nextActor(newBattle);
  newBattle.turns.push(wait(newBattle, firstWaiting.restWt, getDatetime()));

  newBattle.result = isSettlement(newBattle);
  if (newBattle.result !== GameOngoing) {
    return newBattle;
  }

  while (underStatus(sleep, firstWaiting)) {
    newBattle.turns.push(stay(newBattle, firstWaiting, getDatetime()));
    newBattle.result = isSettlement(newBattle);
    if (newBattle.result !== GameOngoing) {
      return newBattle;
    }

    firstWaiting = nextActor(newBattle);
    newBattle.turns.push(wait(newBattle, firstWaiting.restWt, getDatetime()));
    newBattle.result = isSettlement(newBattle);
    if (newBattle.result !== GameOngoing) {
      return newBattle;
    }
  }

  return newBattle;
};
