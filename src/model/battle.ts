import type { Turn, Order } from "./turn";
import type { Unit, UnitReference } from "./unit";
import type { GetPiece } from "./piece";
import type { Resolvers } from "./resolver";

import { z } from "zod";

import { copyTurn, turnSchema, clearActorStatuses, applyActorCost } from "./turn";
import { copyUnit, buildNormalUnits } from "./unit";
import { validateReceivers, ReceiverDuplicationError } from "./action";
import { DataNotFoundError } from "./error";

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

// 対戦モード。normal=7駒固定/war=駒数自由。
export const modeSchema = z.enum(["normal", "war"]);
export type Mode = z.infer<typeof modeSchema>;
export const NORMAL_MODE: Mode = "normal";
export const WAR_MODE: Mode = "war";

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

// 編成中のbattleに編成済みunitsで先頭Turnを積み、対戦を開始する(copyBattle + start を一つにまとめる)。
export type Format = (battle: Battle, units: Unit[], datetime: Date) => Battle;
export const format: Format = (battle, units, datetime) => {
  const newBattle = copyBattle(battle);
  newBattle.turns.push(start(units, datetime));
  return newBattle;
};

// 通常モードの編成: 固定の駒構成(buildNormalUnits)で開始する。unitsを引数に取らない。
export type FormatNormal = (battle: Battle, getPiece: GetPiece, datetime: Date) => Battle;
export const formatNormal: FormatNormal = (battle, getPiece, datetime) =>
  format(battle, buildNormalUnits(getPiece), datetime);

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

// 投了: copyBattle・投了Turn追加・決着記録(isSettlement)を一つにまとめる。決着はisSettlementのSURRENDER分岐が判定する。
export type SurrenderBattle = (battle: Battle, actor: UnitReference, datetime: Date) => Battle;
export const surrenderBattle: SurrenderBattle = (battle, actor, datetime) => {
  const newBattle = copyBattle(battle);
  newBattle.turns.push(surrender(newBattle, actor, datetime));
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};

// step15: spendTurnを doNothing / doAct に分割。共通処理(statusクリア→効果適用→cost消費→Turn追加→勝敗判定)はappendTurnへ。
// status失効/cost消費はturn.tsの責務(clearActorStatuses/applyActorCost)。actionはunitsを受けて計算する(Turn非依存)。
// 死亡駒は除外せずunitsに残し、並べ替えもしない(行動順・次actorはsortedUnits/nextActorで算出。§7.4b)。
const appendTurn = (
  battle: Battle,
  actor: UnitReference,
  order: Order,
  cost: number,
  datetime: Date,
  apply: (units: Unit[]) => Unit[],
): Battle => {
  const newBattle = copyBattle(battle);
  const lastTurn = arrayLast(newBattle.turns);

  // 1. actorの行動開始: 持続statusをクリア(次の自分の行動まで有効)。
  let units: Unit[] = clearActorStatuses(lastTurn.units, actor);
  // 2. 技の効果を適用(doNothingは何もしない)。
  units = apply(units);
  // 3. actorのcost消費(stepBase + cost。何もしない=0)。
  units = applyActorCost(units, actor, newBattle.stepBase, cost);
  // 4. 死亡除外・並べ替えはせず、そのままTurnに積む。
  const newTurn: Turn = { datetime, previous: newBattle.turns.length - 1, order, units };
  newBattle.turns.push(newTurn);
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};

// 何もしない: 行動内容(action)は不要。statusクリアとcost消費(0)のみ。
export type DoNothing = (battle: Battle, actor: UnitReference, datetime: Date) => Battle;
export const doNothing: DoNothing = (battle, actor, datetime) =>
  appendTurn(battle, actor, { type: "DO_NOTHING", actor }, 0, datetime, (units) => units);

// 技を実行: actionKeyをresolverで解決(存在チェックもここで行う)、receiverへ効果を適用しactorのcostを消費する。
export type DoAct = (
  battle: Battle,
  actor: UnitReference,
  actionKey: string,
  receivers: UnitReference[],
  resolvers: Resolvers,
  datetime: Date,
) => Battle | DataNotFoundError | ReceiverDuplicationError;
export const doAct: DoAct = (battle, actor, actionKey, receivers, resolvers, datetime) => {
  // 受け手の重複はドメイン制約。技解決の前に検証する(旧controller act側の検証をここへ集約)。
  const duplication = validateReceivers(receivers);
  if (duplication) {
    return duplication;
  }
  const action = resolvers.getAction(actionKey);
  if (!action) {
    return new DataNotFoundError(actionKey, "action", `${actionKey}というactionは存在しません`);
  }
  const order: Order = { type: "DO_ACTION", actionKey: action.key, actor, receivers };
  return appendTurn(battle, actor, order, action.cost, datetime, (units) =>
    action.act(actor, receivers, units, resolvers.getPiece),
  );
};
