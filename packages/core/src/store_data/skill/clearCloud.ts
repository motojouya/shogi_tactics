import type { Skill, ActionToField } from "../../model/skill";
import { calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_WIND } from "../../model/skill";

const changeClimate: ActionToField = (self, actor, randoms, field) => ({
  ...field,
  climate: "SUNNY",
});

export const clearCloud: Skill = {
  name: "clearCloud",
  label: "晴れ",
  type: "SKILL_TO_FIELD",
  action: changeClimate,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_WIND,
  mpConsumption: 15,
  receiverCount: 0,
  additionalWt: 100,
  effectLength: 0,
  getAccuracy: calcOrdinaryAccuracy,
  description: "天候操作。晴れにする",
};
