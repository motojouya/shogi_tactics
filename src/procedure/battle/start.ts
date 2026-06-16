import type { Battle } from "../../model/battle";
import type { Unit } from "../../model/unit";
import type { BattleRepository } from "../../store/battle";
import type { Dialogue } from "../../io/window_dialogue";

import { createBattle, start } from "../../model/battle";

// keyと日時はdialogue(provider)経由で供給する。player名/stepBase/unitCount/versionは登録フォームから受け取る。
// step6: ロスターはpiece選択から組んだunitsを受け取り、先頭Turn.unitsとして登録する。
export type StartBattle = (
  battleRepository: BattleRepository,
  dialogue: Dialogue,
) => (
  units: Unit[],
  firstPlayerName: string,
  secondPlayerName: string,
  stepBase: number,
  unitCount: number,
  version: string,
) => Promise<Battle>;
export const startBattle: StartBattle =
  (battleRepository, dialogue) => async (units, firstPlayerName, secondPlayerName, stepBase, unitCount, version) => {
    const battle = createBattle(dialogue.getUuid(), firstPlayerName, secondPlayerName, stepBase, unitCount, version);
    battle.turns.push(start(units, dialogue.now()));

    await battleRepository.save(battle);

    return battle;
  };
