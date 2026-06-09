import type { CharactorBattling } from "./charactor";
import type { Status } from "./status";

import { underStatus } from "./status";
import { getPhysical } from "./charactor";
import {
  directAttackUp,
  directAttackDown,
  directDiffenceUp,
  directDiffenceDown,
  magicAttackUp,
  magicAttackDown,
  magicDiffenceUp,
  magicDiffenceDown,
  fear,
} from "../store_data/status/index";

export type ActionToCharactor = (self: Skill, actor: CharactorBattling, receiver: CharactorBattling) => CharactorBattling;

export type SkillToCharactor = {
  name: string;
  label: string;
  action: ActionToCharactor;
  baseDamage: number;
  receiverCount: number;
  additionalWt: number;
  effectLength: number;
  description: string;
};

export type Skill = SkillToCharactor;

type CalcDirectAttack = (skill: Skill, attacker: CharactorBattling) => number;
const calcDirectAttack: CalcDirectAttack = (skill, attacker) => {
  const physical = getPhysical(attacker);

  const upRate = underStatus(directAttackUp, attacker) ? 1.2 : 1;
  const downRate = underStatus(directAttackDown, attacker) ? 0.8 : 1;
  const fearRate = underStatus(fear, attacker) ? 0.8 : 1;

  return ((physical.STR + physical.DEX) * 100 * upRate * downRate * fearRate) / 100;
};

type CalcDirectDefence = (skill: Skill, defencer: CharactorBattling) => number;
const calcDirectDefence: CalcDirectDefence = (skill, defencer) => {
  const physical = getPhysical(defencer);

  const upRate = underStatus(directDiffenceUp, defencer) ? 1.2 : 1;
  const downRate = underStatus(directDiffenceDown, defencer) ? 0.8 : 1;
  const fearRate = underStatus(fear, defencer) ? 0.8 : 1;

  return ((physical.VIT + physical.STR) * 100 * 100 * upRate * downRate * fearRate) / 100 / 100;
};

export const calcOrdinaryDirectDamage: ActionToCharactor = (self, actor, receiver) => {
  let damage = self.baseDamage + calcDirectAttack(self, actor) - calcDirectDefence(self, receiver);
  if (damage < 1) {
    damage = 1;
  }

  let restHp = receiver.hp - damage;
  if (restHp < 0) {
    restHp = 0;
  }

  return {
    ...receiver,
    hp: restHp,
    statuses: [...receiver.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  };
};

type CalcMagicalAttack = (skill: Skill, attacker: CharactorBattling) => number;
const calcMagicalAttack: CalcMagicalAttack = (skill, attacker) => {
  const physical = getPhysical(attacker);

  const upRate = underStatus(magicAttackUp, attacker) ? 1.2 : 1;
  const downRate = underStatus(magicAttackDown, attacker) ? 0.8 : 1;

  return ((physical.INT + physical.MND) * 100 * upRate * downRate) / 100;
};

type CalcMagicalDefence = (skill: Skill, defencer: CharactorBattling) => number;
const calcMagicalDefence: CalcMagicalDefence = (skill, defencer) => {
  const physical = getPhysical(defencer);

  const upRate = underStatus(magicDiffenceUp, defencer) ? 1.2 : 1;
  const downRate = underStatus(magicDiffenceDown, defencer) ? 0.8 : 1;

  return ((physical.VIT + physical.MND) * 100 * 100 * upRate * downRate) / 100 / 100;
};

export const calcOrdinaryMagicalDamage: ActionToCharactor = (self, actor, receiver) => {
  let damage = self.baseDamage + calcMagicalAttack(self, actor) - calcMagicalDefence(self, receiver);
  if (damage < 1) {
    damage = 1;
  }

  let restHp = receiver.hp - damage;
  if (restHp < 0) {
    restHp = 0;
  }

  return {
    ...receiver,
    hp: restHp,
    statuses: [...receiver.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  };
};

export type AddStatus = (status: Status) => ActionToCharactor;
export const addStatus: AddStatus = (status) => (self, actor, receiver) => {
  const newReceiver = {
    ...receiver,
    statuses: [...receiver.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  };
  if (!underStatus(status, newReceiver)) {
    newReceiver.statuses.push({
      status,
      restWt: status.wt,
    });
  }
  return newReceiver;
};
