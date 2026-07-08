import type { Turn, Order } from "./turn";
import type { Unit, UnitReference, Side } from "./unit";
import type { GetPiece, Piece } from "./piece";
import type { Action } from "./action";
import type { Resolvers } from "./resolver";

import { z } from "zod";

import {
  copyTurn,
  turnSchema,
  start,
  getFormationUnits as getFormationTurnUnits,
  sortedUnits as sortedTurnUnits,
  nextActor as nextTurnActor,
} from "./turn";
import {
  copyUnit,
  sameUnit,
  toUnitReference,
  buildNormalUnits,
  isFormationComplete,
  canAddPiece,
  sideHasLeader,
  nextFormationSide,
  clearActorStatuses,
  applyActorCost,
} from "./unit";
import { validateReceivers } from "./action";
import { DataNotFoundError, ReceiverDuplicationError, InvalidArgumentError } from "./error";

const arrayLast = <T>(ary: Array<T>): T => ary.slice(-1)[0];

export const gameResultSchema = z.enum(["ONGOING", "FIRST", "SECOND", "DRAW"]);
export type GameResult = z.infer<typeof gameResultSchema>;
export const GameOngoing: GameResult = "ONGOING";
export const GameFirst: GameResult = "FIRST";
export const GameSecond: GameResult = "SECOND";
export const GameDraw: GameResult = "DRAW";

export const NORMAL_UNIT_COUNT = 7;
export const NORMAL_STEP_BASE = 14;

export const MAX_PLAYER_NAME_LENGTH = 30;
export const MIN_STEP_BASE = 1;
export const MAX_STEP_BASE = 999;
export const MIN_UNIT_COUNT = 1;
export const MAX_UNIT_COUNT = 14;

// 文字列の文字数(コードポイント数)。サロゲートペアも1文字として数え、バイト数では数えない。
const charLength = (value: string): number => [...value].length;

export type ValidateBattleArgs = (
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
) => InvalidArgumentError | null;
export const validateBattleArgs: ValidateBattleArgs = (firstPlayerName, secondPlayerName, stepBase, unitCount) => {
  if (charLength(firstPlayerName.trim()) < 1 || charLength(firstPlayerName) > MAX_PLAYER_NAME_LENGTH) {
    return new InvalidArgumentError(
      "first_player_name",
      `先手のプレイヤー名は空白以外の1文字以上${MAX_PLAYER_NAME_LENGTH}文字以下で入力してください`,
    );
  }
  if (charLength(secondPlayerName.trim()) < 1 || charLength(secondPlayerName) > MAX_PLAYER_NAME_LENGTH) {
    return new InvalidArgumentError(
      "second_player_name",
      `後手のプレイヤー名は空白以外の1文字以上${MAX_PLAYER_NAME_LENGTH}文字以下で入力してください`,
    );
  }
  if (!Number.isInteger(stepBase) || stepBase < MIN_STEP_BASE || stepBase > MAX_STEP_BASE) {
    return new InvalidArgumentError(
      "stepBase",
      `stepBaseは${MIN_STEP_BASE}から${MAX_STEP_BASE}の整数で入力してください`,
    );
  }
  if (!Number.isInteger(unitCount) || unitCount < MIN_UNIT_COUNT || unitCount > MAX_UNIT_COUNT) {
    return new InvalidArgumentError(
      "unitCount",
      `unitCountは${MIN_UNIT_COUNT}から${MAX_UNIT_COUNT}の整数で入力してください`,
    );
  }
  return null;
};

export const modeSchema = z.enum(["normal", "war"]);
export type Mode = z.infer<typeof modeSchema>;
export const NORMAL_MODE: Mode = "normal";
export const WAR_MODE: Mode = "war";

export const battleSchema = z.object({
  turns: z.array(turnSchema),
  result: gameResultSchema,
  key: z.string(), // uuid v7
  first_player_name: z.string(),
  second_player_name: z.string(),
  stepBase: z.number(),
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

export type GetFormationUnits = (battle: Battle) => Unit[];
export const getFormationUnits: GetFormationUnits = (battle) => getFormationTurnUnits(battle.turns);

export type IsFormation = (battle: Battle) => boolean;
export const isFormation: IsFormation = (battle) => !isFormationComplete(getFormationUnits(battle), battle.unitCount);

export type SortedUnits = (battle: Battle) => Unit[];
export const sortedUnits: SortedUnits = (battle) => sortedTurnUnits(getLastTurn(battle));

export type NextActor = (battle: Battle) => Unit | null;
export const nextActor: NextActor = (battle) => nextTurnActor(getLastTurn(battle));

export type CreateBattle = (
  key: string,
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
  version: string,
) => Battle | InvalidArgumentError;
export const createBattle: CreateBattle = (key, firstPlayerName, secondPlayerName, stepBase, unitCount, version) => {
  const invalid = validateBattleArgs(firstPlayerName, secondPlayerName, stepBase, unitCount);
  if (invalid) {
    return invalid;
  }
  return {
    turns: [],
    result: GameOngoing,
    key,
    first_player_name: firstPlayerName,
    second_player_name: secondPlayerName,
    stepBase,
    unitCount,
    version,
  };
};

export type Format = (battle: Battle, units: Unit[], datetime: Date) => Battle;
export const format: Format = (battle, units, datetime) => {
  const newBattle = copyBattle(battle);
  newBattle.turns.push(start(units, datetime));
  return newBattle;
};

export type FormatNormal = (battle: Battle, getPiece: GetPiece, datetime: Date) => Battle;
export const formatNormal: FormatNormal = (battle, getPiece, datetime) =>
  format(battle, buildNormalUnits(getPiece), datetime);

export type AddFormationUnit = (
  battle: Battle,
  side: Side,
  piece: Piece,
  isLeader: boolean,
) => Battle | InvalidArgumentError;
export const addFormationUnit: AddFormationUnit = (battle, side, piece, isLeader) => {
  if (!isFormation(battle)) {
    return new InvalidArgumentError("battle", "編成中のみunitを追加できます");
  }
  const units = getFormationUnits(battle);
  if (nextFormationSide(units, battle.unitCount) !== side) {
    return new InvalidArgumentError("side", "手番のsideのunitのみ追加できます");
  }
  if (!canAddPiece(units, side, piece.key)) {
    return new InvalidArgumentError("piece", "同じ駒は既に配置されています");
  }
  const asLeader = isLeader && !sideHasLeader(units, side);
  const newBattle = copyBattle(battle);
  newBattle.turns[0].units.push({
    side,
    piece: piece.key,
    hp: piece.MaxHP,
    steps: 0,
    statuses: [],
    leader: asLeader,
  });
  return newBattle;
};

export type UndoFormationUnit = (battle: Battle) => Battle | InvalidArgumentError;
export const undoFormationUnit: UndoFormationUnit = (battle) => {
  if (!isFormation(battle)) {
    return new InvalidArgumentError("battle", "編成中のみunitを取り消しできます");
  }
  if (getFormationUnits(battle).length === 0) {
    return new InvalidArgumentError("battle", "取り消すunitがありません");
  }
  const newBattle = copyBattle(battle);
  newBattle.turns[0].units = newBattle.turns[0].units.slice(0, -1);
  return newBattle;
};

export type IsSettlement = (battle: Battle) => GameResult;
export const isSettlement: IsSettlement = (battle) => {
  const lastTurn = arrayLast(battle.turns);
  if (lastTurn.order.type === "SURRENDER") {
    return lastTurn.order.actor.side === "FIRST" ? GameSecond : GameFirst;
  }

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
    previous: battle.turns.length - 1,
    order: { type: "SURRENDER", actor },
    units: lastTurn.units.map(copyUnit),
  };
};

export type SurrenderBattle = (battle: Battle, actor: UnitReference, datetime: Date) => Battle | InvalidArgumentError;
export const surrenderBattle: SurrenderBattle = (battle, actor, datetime) => {
  if (battle.result !== GameOngoing) {
    return new InvalidArgumentError("battle", "決着済みの対戦では降参できません");
  }
  const newBattle = copyBattle(battle);
  newBattle.turns.push(surrender(newBattle, actor, datetime));
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};

const validateTurnActor = (battle: Battle, actor: UnitReference): InvalidArgumentError | null => {
  if (battle.result !== GameOngoing) {
    return new InvalidArgumentError("battle", "決着済みの対戦では行動できません");
  }
  const expected = nextActor(battle);
  if (!expected || !sameUnit(toUnitReference(expected), actor)) {
    return new InvalidArgumentError("actor", "手番のunitのみ行動できます");
  }
  return null;
};

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

  let units: Unit[] = clearActorStatuses(lastTurn.units, actor);
  units = apply(units);
  units = applyActorCost(units, actor, newBattle.stepBase, cost);
  const newTurn: Turn = { datetime, previous: newBattle.turns.length - 1, order, units };
  newBattle.turns.push(newTurn);
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};

export type DoNothing = (battle: Battle, actor: UnitReference, datetime: Date) => Battle | InvalidArgumentError;
export const doNothing: DoNothing = (battle, actor, datetime) => {
  const invalid = validateTurnActor(battle, actor);
  if (invalid) {
    return invalid;
  }
  return appendTurn(battle, actor, { type: "DO_NOTHING", actor }, 0, datetime, (units) => units);
};

export type DoAct = (
  battle: Battle,
  actor: UnitReference,
  actionKey: string,
  receivers: UnitReference[],
  resolvers: Resolvers,
  datetime: Date,
) => Battle | DataNotFoundError | ReceiverDuplicationError | InvalidArgumentError;
export const doAct: DoAct = (battle, actor, actionKey, receivers, resolvers, datetime) => {
  const invalid = validateTurnActor(battle, actor);
  if (invalid) {
    return invalid;
  }
  const duplication = validateReceivers(receivers);
  if (duplication) {
    return duplication;
  }
  const action = resolvers.getAction(actionKey);
  if (!action) {
    return new DataNotFoundError(actionKey, "action", `${actionKey}というactionは存在しません`);
  }
  if (receivers.length > action.receiverCount) {
    return new InvalidArgumentError("receivers", `この行動で選べる対象は${action.receiverCount}体までです`);
  }
  const candidates = action.filter(actor, getLastTurn(battle).units);
  if (!receivers.every((receiver) => candidates.some((candidate) => sameUnit(candidate, receiver)))) {
    return new InvalidArgumentError("receivers", "対象にできないunitが含まれています");
  }
  for (const receiver of receivers) {
    if (!resolvers.getPiece(receiver.piece)) {
      return new DataNotFoundError(receiver.piece, "piece", `${receiver.piece}というpieceは存在しません`);
    }
  }
  const order: Order = { type: "DO_ACTION", actionKey: action.key, actor, receivers };
  return appendTurn(battle, actor, order, action.cost, datetime, (units) =>
    action.act(actor, receivers, units, resolvers.getPiece),
  );
};

export type UndoTurn = (battle: Battle) => Battle | InvalidArgumentError;
export const undoTurn: UndoTurn = (battle) => {
  if (battle.turns.length < 2) {
    return new InvalidArgumentError("battle", "取り消せる行動がありません");
  }
  const newBattle = copyBattle(battle);
  newBattle.turns = newBattle.turns.slice(0, -1);
  newBattle.result = isSettlement(newBattle);
  return newBattle;
};

export type Simulated = { survive: boolean; unit: Unit | null };

export type Simulate = (
  action: Action,
  actor: UnitReference,
  receiver: UnitReference,
  lastTurn: Turn,
  resolvers: Resolvers,
) => Simulated;
export const simulate: Simulate = (action, actor, receiver, lastTurn, resolvers) => {
  const acted = action.act(actor, [receiver], clearActorStatuses(lastTurn.units, actor), resolvers.getPiece);
  const found = acted.find((unit) => sameUnit(toUnitReference(unit), receiver));

  return {
    survive: !!found && found.hp >= 1,
    unit: found ?? null,
  };
};
