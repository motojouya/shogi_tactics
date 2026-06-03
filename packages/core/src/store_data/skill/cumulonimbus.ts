import type { Skill, ActionToField } from "../../model/skill";
import { calcOrdinaryAccuracy, DIRECT_TYPE_NONE, MAGIC_TYPE_ICE } from "../../model/skill";

const changeClimate: ActionToField = (self, actor, randoms, field) => ({
  ...field,
  climate: "RAIN",
});

export const cumulonimbus: Skill = {
  name: "cumulonimbus",
  label: "雨乞い",
  type: "SKILL_TO_FIELD",
  action: changeClimate,
  directType: DIRECT_TYPE_NONE,
  magicType: MAGIC_TYPE_ICE,
  mpConsumption: 15,
  receiverCount: 0,
  additionalWt: 100,
  effectLength: 0,
  getAccuracy: calcOrdinaryAccuracy,
  description: "天候を雨に",
};
