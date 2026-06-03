import * as skills from "../store_data/skill/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const skillRepository = createMemoryRepository(skills);
