import type { Battle } from "../model/battle";
import type { Turn } from "../model/turn";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { toTurn, toTurnJson, turnSchema } from "./turn";
import { toPartyBattling, toPartyBattlingJson, partyBattlingSchema } from "./party";

import { JsonSchemaUnmatchError, DataNotFoundError } from "../store_utility/schema";
import { GameDraw, GameHome, GameOngoing, GameVisitor } from "../model/battle";
import { CharactorDuplicationError } from "../model/party";

export const battleSchema = z.object({
  key: z.string(),
  first_player_name: z.string(),
  second_player_name: z.string(),
  stepBase: z.number(),
  unitCount: z.number(),
  home: partyBattlingSchema,
  visitor: partyBattlingSchema,
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
  home: toPartyBattlingJson(battle.home),
  visitor: toPartyBattlingJson(battle.visitor),
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

  const home = toPartyBattling(battleJson.home);
  if (home instanceof DataNotFoundError || home instanceof CharactorDuplicationError) {
    return home;
  }

  const visitor = toPartyBattling(battleJson.visitor);
  if (visitor instanceof DataNotFoundError || visitor instanceof CharactorDuplicationError) {
    return visitor;
  }

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
    home,
    visitor,
    turns,
    result,
    version,
  };
};
