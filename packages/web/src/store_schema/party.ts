import type { Party, PartyBattling } from "../model/party";
import type { Charactor, CharactorBattling } from "../model/charactor";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { NotWearableErorr } from "../model/acquirement";
import { DataNotFoundError } from "../store_utility/schema";
import { validate, CharactorDuplicationError } from "../model/party";
import {
  toCharactor,
  toCharactorBattling,
  toCharactorJson,
  toCharactorBattlingJson,
  charactorSchema,
  charactorBattlingSchema,
} from "./charactor";

export const partySchema = z.object({
  name: z.string(),
  charactors: z.array(charactorSchema),
});
export type PartySchema = typeof partySchema;
export type PartyJson = z.infer<PartySchema>;

export const partyBattlingSchema = z.object({
  name: z.string(),
  charactors: z.array(charactorBattlingSchema),
});
export type PartyBattlingSchema = typeof partyBattlingSchema;
export type PartyBattlingJson = z.infer<PartyBattlingSchema>;

export type ToPartyJson = (party: Party) => PartyJson;
export const toPartyJson: ToJson<Party, PartyJson> = (party) => ({
  name: party.name,
  charactors: party.charactors.map(toCharactorJson),
});

export type ToPartyBattlingJson = (party: PartyBattling) => PartyBattlingJson;
export const toPartyBattlingJson: ToJson<PartyBattling, PartyBattlingJson> = (party) => ({
  name: party.name,
  charactors: party.charactors.map(toCharactorBattlingJson),
});

export const toParty: ToModel<Party, PartyJson, NotWearableErorr | DataNotFoundError | CharactorDuplicationError> = (
  partyJson,
) => {
  const { name } = partyJson;

  const charactorObjs: Charactor[] = [];
  for (const charactor of partyJson.charactors) {
    const charactorObj = toCharactor(charactor);
    if (charactorObj instanceof DataNotFoundError || charactorObj instanceof NotWearableErorr) {
      return charactorObj;
    }
    charactorObjs.push(charactorObj);
  }

  const validateResult = validate(name, charactorObjs);
  if (validateResult instanceof CharactorDuplicationError) {
    return validateResult;
  }

  return {
    name,
    charactors: charactorObjs,
  };
};

export const toPartyBattling: ToModel<
  PartyBattling,
  PartyBattlingJson,
  NotWearableErorr | DataNotFoundError | CharactorDuplicationError
> = (partyJson) => {
  const { name } = partyJson;

  const charactorObjs: CharactorBattling[] = [];
  for (const charactor of partyJson.charactors) {
    const charactorObj = toCharactorBattling(charactor);
    if (charactorObj instanceof DataNotFoundError || charactorObj instanceof NotWearableErorr) {
      return charactorObj;
    }
    charactorObjs.push(charactorObj);
  }

  const validateResult = validate(name, charactorObjs);
  if (validateResult instanceof CharactorDuplicationError) {
    return validateResult;
  }

  return {
    name,
    charactors: charactorObjs,
  };
};
