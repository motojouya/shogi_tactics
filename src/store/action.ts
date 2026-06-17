import * as actions from "../data/action/index";
import { createMemoryRepository } from "./memory_repository";

export const actionRepository = createMemoryRepository(actions);
