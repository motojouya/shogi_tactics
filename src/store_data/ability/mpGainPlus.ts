import type { Ability, Wait } from "../../model/ability";
import { getPhysical } from "../../model/charactor";

const wait: Wait = (wt, charactor) => {
  const turnAdd = Math.floor(wt / 20);
  let mp = charactor.mp + turnAdd;

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
