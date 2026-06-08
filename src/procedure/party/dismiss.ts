import type { Dialogue } from "../../io/window_dialogue";
import type { PartyRepository } from "../../store/party";

export type DismissParty = (dialogue: Dialogue, repository: PartyRepository) => (name: string) => Promise<boolean>;
export const dismissParty: DismissParty = (dialogue, repository) => async (name) => {
  if (!dialogue.confirm("削除してもよいですか？")) {
    return false;
  }
  await repository.remove(name);
  return true;
};
