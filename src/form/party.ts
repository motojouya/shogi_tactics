import type { Party } from "../model/party";
import type { Charactor } from "../model/charactor";

import { z } from "zod";

import { DataNotFoundError } from "../store_utility/schema";
import { charactorFormSchema, toCharactor, toCharactorForm } from "./charactor";
import { validate, CharactorDuplicationError } from "../model/party";
import { EmptyParameter } from "../io/window_dialogue";

export const partyFormSchema = z.object({
  name: z.string().min(1),
  charactors: z.array(charactorFormSchema),
});
export type PartyForm = z.infer<typeof partyFormSchema>;

export type ToPartyForm = (party: Party) => PartyForm;
export const toPartyForm: ToPartyForm = (party) => ({
  name: party.name,
  charactors: party.charactors.map(toCharactorForm),
});

export type ToParty = (
  partyForm: PartyForm,
) => Party | DataNotFoundError | CharactorDuplicationError;
export const toParty: ToParty = (partyForm) => {
  const { name } = partyForm;

  const charactorObjs: Charactor[] = [];
  for (const charactor of partyForm.charactors) {
    const charactorObj = toCharactor(charactor);
    if (
      charactorObj instanceof DataNotFoundError ||
      charactorObj instanceof EmptyParameter
    ) {
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
