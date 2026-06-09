import type { Party } from "../../model/party";
import type { Dialogue } from "../../io/window_dialogue";
import type { PartyRepository } from "../../store/party";

import { CharactorDuplicationError } from "../../model/party";
import { JsonSchemaUnmatchError, DataNotFoundError } from "../../store_utility/schema";
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
    party instanceof DataNotFoundError ||
    party instanceof CharactorDuplicationError
  ) {
    dialogue.notice(party.message);
    return party;
  }

  return party;
};
