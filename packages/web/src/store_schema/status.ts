import type { Status } from "../model/status";
import type { ToModel, ToJson } from "../store_utility/schema";

import { z } from "zod";

import { DataNotFoundError } from "../store_utility/schema";
import { statusRepository } from "../store/status";

export const statusSchema = z.string();
export type StatusSchema = typeof statusSchema;
export type StatusJson = z.infer<StatusSchema>;

export const toStatusJson: ToJson<Status, StatusJson> = (status) => status.name;

export const toStatus: ToModel<Status, StatusJson, DataNotFoundError> = (statusJson) => {
  const status = statusRepository.get(statusJson);
  if (!status) {
    return new DataNotFoundError(statusJson, "status", `${statusJson}というstatusは存在しません`);
  }

  return status;
};
