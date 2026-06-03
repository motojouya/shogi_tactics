import type { Randoms } from "./random";
import { validateRandoms, RandomRangeError } from "./random";

export type Climate = "SUNNY" | "RAIN" | "STORM" | "SNOW" | "FOGGY";
type ClimateParcent = {
  name: Climate;
  parcent: number;
};

const climateParcent: ClimateParcent[] = [
  { name: "SUNNY", parcent: 40 },
  { name: "RAIN", parcent: 30 },
  { name: "FOGGY", parcent: 10 },
  { name: "STORM", parcent: 10 },
  { name: "SNOW", parcent: 10 },
];

// FIXME 天候をかえるすべはあれど、天候の効果が実装されていない状態
// ゲーム上で既にいろいろな変数があるので、バランス見て実装していく
export type ChangeClimate = (randoms: Randoms) => Climate;
export const changeClimate: ChangeClimate = (randoms) => {
  const validateResult = validateRandoms(randoms);
  if (validateResult instanceof RandomRangeError) {
    console.debug(validateResult);
    throw new Error(validateResult.message);
  }

  const parcentAccuracy = randoms.accuracy * 100;
  const candidates = climateParcent.reduce((acc, climate) => {
    const climateCalc = { ...climate };
    if (acc.length === 0) {
      return [climateCalc];
    }

    const lastOne = acc.slice(-1)[0];
    climateCalc.parcent += lastOne.parcent;
    acc.push(climateCalc);

    return acc;
  }, [] as ClimateParcent[]);

  const climate = candidates.find((candidate) => candidate.parcent >= parcentAccuracy);
  if (climate) {
    return climate.name;
  } else {
    return "SUNNY";
  }
};

export type Field = {
  climate: Climate;
};
