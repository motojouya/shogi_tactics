import * as statuses from "../data/status/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const statusRepository = createMemoryRepository(statuses);
