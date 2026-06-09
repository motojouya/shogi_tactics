import type { Skill } from "../model/skill";

import * as skills from "../store_data/skill/index";
import { createMemoryRepository } from "../store_utility/memory_repository";

export const skillRepository = createMemoryRepository(skills);

// FIXME acquirement削除に伴う応急処置。装備からskillを導出できなくなったため、基本技を固定で返す
const BASIC_SKILL_NAMES = ["chop", "stab", "shot", "blow"];
export type GetSkills = () => Skill[];
export const getSkills: GetSkills = () =>
  BASIC_SKILL_NAMES.map((name) => skillRepository.get(name)).filter((skill): skill is Skill => !!skill);
