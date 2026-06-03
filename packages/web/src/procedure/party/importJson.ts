import type { Party } from "@motojouya/kniw-core/model/party";
import type { Dialogue } from "../../io/window_dialogue";
import type { PartyRepository } from "@motojouya/kniw-core/store/party";

import { CharactorDuplicationError } from "@motojouya/kniw-core/model/party";
import { NotWearableErorr } from "@motojouya/kniw-core/model/acquirement";
import { JsonSchemaUnmatchError, DataNotFoundError } from "@motojouya/kniw-core/store_utility/schema";
import { UserCancel, EmptyParameter } from "../../io/window_dialogue";

export type ImportParty = (
  dialogue: Dialogue,
  repository: PartyRepository,
) => (
  comfirmMessage: string | undefined,
) => Promise<
  | Party
  | DataNotFoundError
  | JsonSchemaUnmatchError
  | NotWearableErorr
  | CharactorDuplicationError
  | EmptyParameter
  | UserCancel
>;
export const importParty: ImportParty = (dialogue, repository) => async (comfirmMessage) => {
  if (comfirmMessage && !dialogue.confirm(comfirmMessage)) {
    return new UserCancel("importしていません");
  }

  const party = await repository.importJson("");
  if (!party) {
    dialogue.notice("partyがありません");
    return new EmptyParameter("party", "partyがありません");
  }

  if (
    party instanceof JsonSchemaUnmatchError ||
    party instanceof NotWearableErorr ||
    party instanceof DataNotFoundError ||
    party instanceof CharactorDuplicationError
  ) {
    dialogue.notice(party.message);
    return party;
  }

  return party;
};
