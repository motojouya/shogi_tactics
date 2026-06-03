import type { PartyForm } from "../../form/party";
import type { PartyRepository } from "@motojouya/kniw-core/store/party";

import { DataExistError, DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";
import { NotWearableErorr } from "@motojouya/kniw-core/model/acquirement";
import { CharactorDuplicationError } from "@motojouya/kniw-core/model/party";
import { toParty } from "../../form/party";

export type SaveParty = (
  repository: PartyRepository,
  checkExists: boolean,
) => (
  partyForm: PartyForm,
) => Promise<null | DataNotFoundError | NotWearableErorr | CharactorDuplicationError | DataExistError>;
export const saveParty: SaveParty = (repository, checkExists) => async (partyForm) => {
  const party = toParty(partyForm);
  if (
    party instanceof DataNotFoundError ||
    party instanceof NotWearableErorr ||
    party instanceof CharactorDuplicationError
  ) {
    return party;
  }

  if (checkExists) {
    const partyNames = await repository.list();
    if (partyNames.includes(party.name)) {
      return new DataExistError(party.name, "party", `${party.name}というpartyは既に存在します`);
    }
  }

  await repository.save(party);
  return null;
};
