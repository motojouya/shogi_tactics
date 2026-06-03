import type { Ability, Wait } from "../../model/ability";
import { getPhysical } from "../../model/charactor";

const wait: Wait = (wt, charactor, randoms) => {
  const turnAdd = Math.floor(wt / 20);
  let randomAdd = Math.ceil(randoms.damage * 5);
  if (turnAdd < randomAdd) {
    randomAdd = 0;
  }
  let mp = charactor.mp + turnAdd + randomAdd;

  const physical = getPhysical(charactor);
  if (mp > physical.MaxMP) {
    mp = physical.MaxMP;
  }

  return {
    ...charactor,
    mp,
    statuses: [...charactor.statuses.map((attachedStatus) => ({ ...attachedStatus }))],
  };
};

export const mpGainPlus: Ability = {
  name: "mpGainPlus",
  label: "MP回復強化",
  wait,
  description: "MPの回復速度が早くなる",
};
