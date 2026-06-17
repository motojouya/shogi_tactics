import type { Battle } from "../model/battle";
import type { Repository } from "./disk_repository";

import { battleSchema } from "../model/battle";
import { createRepository as createRepositoryBase } from "./disk_repository";

export const NAMESPACE = "battle";
export const SCHEMA_KEY = "key";

export type BattleRepository = Repository<Battle>;

// model型(Battle)をそのまま保存・取得する。検証schemaはmodelのbattleSchema。converterは不要。
export const createRepository = createRepositoryBase<typeof battleSchema, Battle>(NAMESPACE, battleSchema, SCHEMA_KEY);
