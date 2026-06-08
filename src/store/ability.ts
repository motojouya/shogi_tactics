import * as abilities from "../store_data/ability/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const abilityRepository = createMemoryRepository(abilities);
