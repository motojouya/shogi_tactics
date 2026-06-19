import type { Turn, Order } from "./turn";
import type { Unit, UnitReference } from "./unit";
import type { Action } from "./action";

import { z } from "zod";

import { copyTurn, turnSchema } from "./turn";
import { copyUnit, sameUnit } from "./unit";

const arrayLast = <T>(ary: Array<T>): T => ary.slice(-1)[0];

// types.md準拠。先手=FIRST, 後手=SECOND。step12: zod schemaから型導出。
export const gameResultSchema = z.enum(["ONGOING", "FIRST", "SECOND", "DRAW"]);
export type GameResult = z.infer<typeof gameResultSchema>;
export const GameOngoing: GameResult = "ONGOING";
export const GameFirst: GameResult = "FIRST";
export const GameSecond: GameResult = "SECOND";
export const GameDraw: GameResult = "DRAW";

// note.md「通常モード」準拠。片側7駒固定、stepBaseは14(=unitCount*2)。
export const NORMAL_UNIT_COUNT = 7;
export const NORMAL_STEP_BASE = 14;

// step6: home/visitor(PartyBattling)を廃止。ロスターは先頭Turnのunitsが持つ(types.md準拠)。
export const battleSchema = z.object({
  turns: z.array(turnSchema), // turns.length===0は編成段階。先頭Turn.unitsがロスター
  result: gameResultSchema,
  // types.md準拠のbattle基礎項目(step5で供給)
  key: z.string(), // uuid v7。画面に表示されないkey(provider経由で供給)
  first_player_name: z.string(),
  second_player_name: z.string(),
  stepBase: z.number(), // 順番ポイントのBASE(=開始時の総駒数)。1以上
  unitCount: z.number(),
  version: z.string(),
});
export type Battle = z.infer<typeof battleSchema>;

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

// step7: 行動ポイント方式。steps最小の駒が次に行動。同点はTurn.unitsのindex(初期順)で決着。
// Array.prototype.sortは安定なので、steps同点は元配列の順序(=前ターンまでの並び)を保つ。
export type SortedUnits = (turn: Turn) => Unit[];
export const sortedUnits: SortedUnits = (turn) =>
  turn.units
    .filter((unit) => unit.hp >= 1)
    .slice()
    .sort((left, right) => left.steps - right.steps);

// 次に行動するunit(生存かつsteps最小)。いなければnull。
export type NextActor = (turn: Turn) => Unit | null;
export const nextActor: NextActor = (turn) => {
  const alive = sortedUnits(turn);
  return alive.length > 0 ? alive[0] : null;
};

// keyはuuid(provider経由)、player名/stepBase/unitCount/versionは登録フォームから受け取る。
// step6: createBattleはbattle骨格(turns=[])のみ生成し、ロスターはstart()でunitsとして積む。
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

// step6/7: 編成済みunitsから先頭Turnを生成する。初期stepsは0なので並びは編成順。
export type Start = (units: Unit[], datetime: Date) => Turn;
export const start: Start = (units, datetime) => ({
  datetime,
  previous: 0, // 先頭Turn(直前なし)
  order: { type: "FORMATION" },
  units: units.map(copyUnit),
});

export type IsSettlement = (battle: Battle) => GameResult;
export const isSettlement: IsSettlement = (battle) => {
  const lastTurn = arrayLast(battle.turns);
  if (lastTurn.order.type === "SURRENDER") {
    return lastTurn.order.actor.side === "FIRST" ? GameSecond : GameFirst;
  }

  // leaderのhpが0になった陣営は敗北。編成時に各陣営ちょうど1体leaderが居る前提。
  const firstLeaderAlive = lastTurn.units.some((unit) => unit.side === "FIRST" && unit.leader && unit.hp >= 1);
  const secondLeaderAlive = lastTurn.units.some((unit) => unit.side === "SECOND" && unit.leader && unit.hp >= 1);

  if (!firstLeaderAlive && !secondLeaderAlive) {
    return GameDraw;
  }
  if (!firstLeaderAlive) {
    return GameSecond;
  }
  if (!secondLeaderAlive) {
    return GameFirst;
  }
  return GameOngoing;
};

export type ModelSurrender = (battle: Battle, actor: UnitReference, datetime: Date) => Turn;
export const surrender: ModelSurrender = (battle, actor, datetime) => {
  const lastTurn = arrayLast(battle.turns);
  return {
    datetime,
    previous: battle.turns.length - 1, // 直前(投了時点)のTurn index
    order: { type: "SURRENDER", actor },
    units: lastTurn.units.map(copyUnit),
  };
};

// 行動内容。null=何もしない。
export type DoActionInput = { action: Action; receivers: UnitReference[] };

// step7: spendTurnを「行動適用→死亡除外→steps更新→並べ替え→勝敗判定」に簡素化。
// WT/restWtの仮想時間・二重Turn・sleepループは廃止。actorはUnitReferenceで受け取る。
export type SpendTurn = (
  battle: Battle,
  actor: UnitReference,
  doAction: DoActionInput | null,
  getDatetime: () => Date,
) => Battle;
export const spendTurn: SpendTurn = (battle, actor, doAction, getDatetime) => {
  const newBattle = copyBattle(battle);
  const lastTurn = arrayLast(newBattle.turns);

  // 1. 作業用units。actorの持続statusは「次の自分の行動まで」有効なので、自分の行動時にクリアする。
  let units: Unit[] = lastTurn.units.map((unit) =>
    sameUnit(unit, actor) ? { ...copyUnit(unit), statuses: [] } : copyUnit(unit),
  );

  let order: Order;
  if (doAction === null) {
    order = { type: "DO_NOTHING", actor };
  } else {
    // 2. 技の効果を適用(Act経由でTurn.unitsを更新)。
    const working: Turn = { datetime: getDatetime(), previous: 0, order: { type: "FORMATION" }, units };
    const acted = doAction.action.act(actor, doAction.receivers, working);
    units = acted.units;
    order = { type: "DO_ACTION", actionKey: doAction.action.key, actor, receivers: doAction.receivers };
  }

  // 3. 行動駒のstepsを加算(stepBase + cost。何もしない=0)。
  const cost = doAction ? doAction.action.cost : 0;
  units = units.map((unit) =>
    sameUnit(unit, actor) ? { ...unit, steps: unit.steps + newBattle.stepBase + cost } : unit,
  );

  // 4. 死亡除外 → steps昇順に並べ替え。
  const newTurn: Turn = { datetime: getDatetime(), previous: newBattle.turns.length - 1, order, units };
  newTurn.units = sortedUnits(newTurn);

  newBattle.turns.push(newTurn);
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};
