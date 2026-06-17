import * as pieces from "../data/piece/index";
import { createMemoryRepository } from "./utility";

export const pieceRepository = createMemoryRepository(pieces);
