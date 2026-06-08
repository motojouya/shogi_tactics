import * as races from "../store_data/acquirement/race/index";
import * as weapons from "../store_data/acquirement/weapon/index";
import * as clothings from "../store_data/acquirement/clothing/index";
import * as blessings from "../store_data/acquirement/blessing/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const raceRepository = createMemoryRepository(races);
export const weaponRepository = createMemoryRepository(weapons);
export const clothingRepository = createMemoryRepository(clothings);
export const blessingRepository = createMemoryRepository(blessings);
