import type { Charactor, CharactorBattling, AttachedStatus } from "../model/charactor";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { DataNotFoundError } from "../store_utility/schema";
import { statusSchema, toStatus, toStatusJson } from "./status";

export const attachedStatusSchema = z.object({
  status: statusSchema,
  restWt: z.number().int(),
});
export type AttachedStatusSchema = typeof attachedStatusSchema;
export type AttachedStatusJson = z.infer<AttachedStatusSchema>;

export const charactorSchema = z.object({
  name: z.string(),
});
export type CharactorSchema = typeof charactorSchema;
export type CharactorJson = z.infer<CharactorSchema>;

export const charactorBattlingSchema = charactorSchema.extend({
  statuses: z.array(attachedStatusSchema),
  hp: z.number().int(),
  restWt: z.number().int(),
  isVisitor: z.boolean(),
});
export type CharactorBattlingSchema = typeof charactorBattlingSchema;
export type CharactorBattlingJson = z.infer<CharactorBattlingSchema>;

export const toAttachedStatusJson: ToJson<AttachedStatus, AttachedStatusJson> = (attached) => ({
  status: toStatusJson(attached.status),
  restWt: attached.restWt,
});

export const toCharactorJson: ToJson<Charactor, CharactorJson> = (charactor) => ({
  name: charactor.name,
});

export const toCharactorBattlingJson: ToJson<CharactorBattling, CharactorBattlingJson> = (charactor) => ({
  name: charactor.name,
  statuses: charactor.statuses.map(toAttachedStatusJson),
  hp: charactor.hp,
  restWt: charactor.restWt,
  isVisitor: charactor.isVisitor,
});

export const toCharactor: ToModel<Charactor, CharactorJson, never> = (charactorJson) => ({
  name: charactorJson.name,
});

export const toCharactorBattling: ToModel<CharactorBattling, CharactorBattlingJson, DataNotFoundError> = (
  charactorJson,
) => {
  const charactor = toCharactor(charactorJson);

  const statuses: AttachedStatus[] = [];
  for (const attachedStatusJson of charactorJson.statuses) {
    const statusObj = toStatus(attachedStatusJson.status);

    if (statusObj instanceof DataNotFoundError) {
      return statusObj;
    }

    statuses.push({
      status: statusObj,
      restWt: attachedStatusJson.restWt,
    });
  }

  return {
    ...charactor,
    statuses,
    hp: 0 + charactorJson.hp,
    restWt: 0 + charactorJson.restWt,
    isVisitor: charactorJson.isVisitor,
  };
};
