import type { Battle } from "../model/battle";
import type { BattleJson, BattleSchema } from "../store_schema/battle";
import type { Repository } from "../store_utility/disk_repository";

import { JsonSchemaUnmatchError } from "../store_utility/schema";
import { toBattleJson, toBattle, battleSchema } from "../store_schema/battle";
import { createRepository as createRepositoryBase } from "../store_utility/disk_repository";

export const NAMESPACE = "battle";
export const SCHEMA_KEY = "key";

export type BattleRepository = Repository<Battle, JsonSchemaUnmatchError>;

export const createRepository = createRepositoryBase<BattleSchema, Battle, BattleJson, JsonSchemaUnmatchError>(
  NAMESPACE,
  battleSchema,
  toBattle,
  toBattleJson,
  SCHEMA_KEY,
);
