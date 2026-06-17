import type { Battle } from "../model/battle";
import type { Turn } from "../model/turn";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { toTurn, toTurnJson, turnSchema } from "./turn";

import { GameDraw, GameFirst, GameOngoing, GameSecond } from "../model/battle";

// step6: home/visitorを廃止。ロスターは先頭Turn.unitsが持つ。
export const battleSchema = z.object({
  key: z.string(),
  first_player_name: z.string(),
  second_player_name: z.string(),
  stepBase: z.number(),
  unitCount: z.number(),
  turns: z.array(turnSchema),
  result: z.enum([GameOngoing, GameFirst, GameSecond, GameDraw]),
  version: z.string(),
});
export type BattleSchema = typeof battleSchema;
export type BattleJson = z.infer<BattleSchema>;

export const toBattleJson: ToJson<Battle, BattleJson> = (battle) => ({
  key: battle.key,
  first_player_name: battle.first_player_name,
  second_player_name: battle.second_player_name,
  stepBase: battle.stepBase,
  unitCount: battle.unitCount,
  turns: battle.turns.map(toTurnJson),
  result: battle.result,
  version: battle.version,
});

// datetimeはschema(turnSchema)でDate化済み。toTurnはエラーを返さないため、構造を写すだけ。
export type ToBattle = ToModel<Battle, BattleJson, never>;
export const toBattle: ToBattle = (battleJson) => {
  const { key, first_player_name, second_player_name, stepBase, unitCount, version, result } = battleJson;

  const turns: Turn[] = battleJson.turns.map(toTurn);

  return {
    key,
    first_player_name,
    second_player_name,
    stepBase,
    unitCount,
    turns,
    result,
    version,
  };
};
