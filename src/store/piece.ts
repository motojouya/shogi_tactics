import * as pieces from "../data/piece/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const pieceRepository = createMemoryRepository(pieces);
