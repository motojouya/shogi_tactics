import * as statuses from "../data/status/index";
import { createMemoryRepository } from "./utility";

export const statusRepository = createMemoryRepository(statuses);
