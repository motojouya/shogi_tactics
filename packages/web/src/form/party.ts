import type { Party } from "@motojouya/kniw-core/model/party";
import type { Charactor } from "@motojouya/kniw-core/model/charactor";

import { z } from "zod";

import { DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";
import { NotWearableErorr } from "@motojouya/kniw-core/model/acquirement";
import { charactorFormSchema, toCharactor, toCharactorForm } from "./charactor";
import { validate, CharactorDuplicationError } from "@motojouya/kniw-core/model/party";
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
) => Party | NotWearableErorr | DataNotFoundError | CharactorDuplicationError;
export const toParty: ToParty = (partyForm) => {
  const { name } = partyForm;

  const charactorObjs: Charactor[] = [];
  for (const charactor of partyForm.charactors) {
    const charactorObj = toCharactor(charactor);
    if (
      charactorObj instanceof DataNotFoundError ||
      charactorObj instanceof NotWearableErorr ||
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
