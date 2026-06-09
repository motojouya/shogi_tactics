export type Physical = {
  MaxHP: number;
  WT: number;
  move: number;
};

const zeroPhysical: Physical = {
  MaxHP: 0,
  WT: 0,
  move: 0,
};

type AddPhysical = (left: Physical, right: Physical) => Physical;
const addPhysical: AddPhysical = (left, right) => ({
  MaxHP: left.MaxHP + right.MaxHP,
  WT: left.WT + right.WT,
  move: left.move + right.move,
});

export type AddPhysicals = (physicals: Physical[]) => Physical;
export const addPhysicals: AddPhysicals = (physicals) =>
  physicals.reduce((acc, item) => addPhysical(acc, item), zeroPhysical);
