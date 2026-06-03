import type { Party } from "../model/party";
import type { PartyJson, PartySchema } from "../store_schema/party";
import type { Repository } from "../store_utility/disk_repository";

import { CharactorDuplicationError } from "../model/party";
import { toParty, toPartyJson, partySchema } from "../store_schema/party";

import { NotWearableErorr } from "../model/acquirement";
import { DataNotFoundError } from "../store_utility/schema";
import { createRepository as createRepositoryBase } from "../store_utility/disk_repository";

export const NAMESPACE = "party";
export const SCHEMA_KEY = "name";

export type PartyRepository = Repository<Party, NotWearableErorr | DataNotFoundError | CharactorDuplicationError>;

export const createRepository = createRepositoryBase<
  PartySchema,
  Party,
  PartyJson,
  NotWearableErorr | DataNotFoundError | CharactorDuplicationError
>(NAMESPACE, partySchema, toParty, toPartyJson, SCHEMA_KEY);
