import type { Charactor } from "../model/charactor";
import type { CharactorSchema, CharactorJson } from "../store_schema/charactor";

import { toCharactor, toCharactorJson, charactorSchema } from "../store_schema/charactor";
import { NotWearableErorr } from "../model/acquirement";
import { DataNotFoundError } from "../store_utility/schema";
import { createRepository as createRepositoryBase } from "../store_utility/disk_repository";

export const NAMESPACE = "charactor";
export const SCHEMA_KEY = "name";

export const createRepository = createRepositoryBase<
  CharactorSchema,
  Charactor,
  CharactorJson,
  NotWearableErorr | DataNotFoundError
>(NAMESPACE, charactorSchema, toCharactor, toCharactorJson, SCHEMA_KEY);
