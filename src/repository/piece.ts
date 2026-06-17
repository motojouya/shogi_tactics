import * as pieces from "../data/piece/index";
import { createMemoryRepository } from "./memory_repository";

export const pieceRepository = createMemoryRepository(pieces);
