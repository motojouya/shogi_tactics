import * as actions from "../data/action/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const actionRepository = createMemoryRepository(actions);
