import * as statuses from "../data/status/index";
import { createMemoryRepository } from "./memory_repository";

export const statusRepository = createMemoryRepository(statuses);
