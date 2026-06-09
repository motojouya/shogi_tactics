import type { Battle } from "../../model/battle";
import type { Party } from "../../model/party";
import type { BattleRepository } from "../../store/battle";

import { wait, turnActor, createBattle, start } from "../../model/battle";

export type StartBattle = (
  battleRepository: BattleRepository,
) => (title: string, homeParty: Party, visitorParty: Party, startDate: Date) => Promise<Battle>;
export const startBattle: StartBattle = (battleRepository) => async (title, homeParty, visitorParty, startDate) => {
  const battle = createBattle(title, homeParty, visitorParty);
  const turn = start(battle, startDate);
  battle.turns.push(turn);

  const firstWaiting = turnActor(turn);
  battle.turns.push(wait(battle, firstWaiting.restWt, startDate));

  await battleRepository.save(battle);

  return battle;
};
