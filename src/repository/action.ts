import * as actions from "../data/action/index";
import { createMemoryRepository } from "./utility";

export const actionRepository = createMemoryRepository(actions);
