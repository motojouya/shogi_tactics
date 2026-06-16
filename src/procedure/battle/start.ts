import type { Battle } from "../../model/battle";
import type { Party } from "../../model/party";
import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";

import { wait, turnActor, createBattle, start } from "../../model/battle";

// keyと日時はdialogue(provider)経由で供給する。stepBase/unitCount/versionは登録フォームから受け取る。
export type StartBattle = (
  battleRepository: BattleRepository,
  dialogue: Dialogue,
) => (homeParty: Party, visitorParty: Party, stepBase: number, unitCount: number, version: string) => Promise<Battle>;
export const startBattle: StartBattle =
  (battleRepository, dialogue) => async (homeParty, visitorParty, stepBase, unitCount, version) => {
    const battle = createBattle(dialogue.getUuid(), homeParty, visitorParty, stepBase, unitCount, version);
    const turn = start(battle, dialogue.now());
    battle.turns.push(turn);

    const firstWaiting = turnActor(turn);
    battle.turns.push(wait(battle, firstWaiting.restWt, dialogue.now()));

    await battleRepository.save(battle);

    return battle;
  };
