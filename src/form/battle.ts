import type { CharactorBattling } from "../model/charactor";
import type { Action } from "../model/battle";
import type { SelectOption } from "../io/dialogue";
import type { Skill } from "../model/skill";

import { z } from "zod";

import { DataNotFoundError } from "../store_utility/schema";
import { isVisitorString } from "../model/charactor";
import { skillRepository } from "../store/skill";
import { ACTION_DO_NOTHING } from "../model/turn";

export const DO_NOTHING = "NOTHING";

export class ReceiverDuplicationError {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export const doSkillFormSchema = z.object({
  skillName: z.string().min(1),
  receiversWithIsVisitor: z.array(z.object({ value: z.string().min(1).optional() }).optional()),
});
export type DoSkillForm = z.infer<typeof doSkillFormSchema>;

export type ToSkill = (skillName: string) => Skill | null;
export const toSkill: ToSkill = (skillName) => {
  if (skillName === ACTION_DO_NOTHING) {
    return null;
  }

  return skillRepository.get(skillName);
};

export type ReceiverSelectOption = (receiver: CharactorBattling) => SelectOption;
export const receiverSelectOption: ReceiverSelectOption = (receiver) => ({
  value: `${receiver.name}__${isVisitorString(receiver.isVisitor)}`,
  label: `${receiver.name}(${isVisitorString(receiver.isVisitor)})`,
});

export type ToReceiver = (receiver: string, candidates: CharactorBattling[]) => CharactorBattling | DataNotFoundError;
export const toReceiver: ToReceiver = (receiver, candidates) => {
  const matches = receiver.match(/^(.*)__(HOME|VISITOR)$/);

  if (!matches) {
    throw new Error(`no match`);
  }

  const name = matches[1];
  if (!name) {
    throw new Error(`no name`);
  }

  const isVisitorStr = matches[2];
  if (isVisitorStr !== "HOME" && isVisitorStr !== "VISITOR") {
    throw new Error(`isVisitorStr must be HOME or VISITOR. (${isVisitorStr})`);
  }
  const isVisitor = isVisitorStr === "VISITOR";

  const willReceiver = candidates.find((candidate) => candidate.name === name && candidate.isVisitor === isVisitor);
  if (!willReceiver) {
    return new DataNotFoundError(name, "charactor", `${name}というcharactorは存在しません`);
  }
  return willReceiver;
};

export type ToAction = (
  doSkillForm: DoSkillForm,
  candidates: CharactorBattling[],
) => Action | null | DataNotFoundError | ReceiverDuplicationError;
export const toAction: ToAction = (doSkillForm, candidates) => {
  const { skillName } = doSkillForm;
  if (skillName === ACTION_DO_NOTHING) {
    return null;
  }

  const skill = skillRepository.get(skillName);
  if (!skill) {
    return new DataNotFoundError(skillName, "skill", `${skillName}というskillは存在しません`);
  }

  const receiverValues = doSkillForm.receiversWithIsVisitor
    .filter((receiver) => !!receiver)
    .map((receiver) => receiver.value)
    .filter((receiverValue) => !!receiverValue);

  if (new Set(receiverValues).size !== receiverValues.length) {
    return new ReceiverDuplicationError("同じキャラクターを複数回えらべません");
  }

  const receivers: CharactorBattling[] = [];
  for (const receiverValue of receiverValues) {
    // @ts-expect-error receiverValueはfilterしてるのでundefinedにならない
    const receiver = toReceiver(receiverValue, candidates);
    if (receiver instanceof DataNotFoundError) {
      return receiver;
    }
    receivers.push(receiver);
  }

  return {
    skill,
    receivers,
  };
};
