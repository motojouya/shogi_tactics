import * as statuses from "../store_data/status/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const statusRepository = createMemoryRepository(statuses);
