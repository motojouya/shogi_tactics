import type { Battle } from "../model/battle";
import type { Turn } from "../model/turn";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { toTurn, toTurnJson, turnSchema } from "./turn";

import { JsonSchemaUnmatchError, DataNotFoundError } from "../store_utility/schema";
import { GameDraw, GameHome, GameOngoing, GameVisitor } from "../model/battle";
import { CharactorDuplicationError } from "../model/party";

// step6: home/visitorを廃止。ロスターは先頭Turn.unitsが持つ。
export const battleSchema = z.object({
  key: z.string(),
  first_player_name: z.string(),
  second_player_name: z.string(),
  stepBase: z.number(),
  unitCount: z.number(),
  turns: z.array(turnSchema),
  result: z.enum([GameOngoing, GameHome, GameVisitor, GameDraw]),
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

export type ToBattle = ToModel<
  Battle,
  BattleJson,
  DataNotFoundError | CharactorDuplicationError | JsonSchemaUnmatchError
>;
export const toBattle: ToBattle = (battleJson) => {
  const { key, first_player_name, second_player_name, stepBase, unitCount, version } = battleJson;

  const turns: Turn[] = [];
  for (const turnJson of battleJson.turns) {
    const turn = toTurn(turnJson);
    if (turn instanceof DataNotFoundError || turn instanceof JsonSchemaUnmatchError) {
      return turn;
    }
    turns.push(turn);
  }

  const { result } = battleJson;

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
