export type Physical = {
  MaxHP: number;
  MaxMP: number;
  STR: number; // 力 物理・投射攻撃の物理攻撃力に影響
  VIT: number; // 生命力 物理・投射攻撃に対する防御力に影響
  DEX: number; // 器用さ 物理・投射攻撃の攻撃力・命中率に影響 特に投射攻撃の攻撃力に強く影響
  AGI: number; // 素早さ 物理・投射攻撃の命中率に影響
  AVD: number; // 回避力 防御時の回避率に影響
  INT: number; // 知力 魔法の攻撃力に影響
  MND: number; // 精神力 魔法の攻守やスペシャルスキルの威力に影響
  RES: number; // 魔法耐性 魔法に対する防御力に影響
  WT: number;
  StabResistance: number;
  SlashResistance: number;
  BlowResistance: number;
  FireSuitable: number;
  RockSuitable: number;
  WaterSuitable: number;
  IceSuitable: number;
  AirSuitable: number;
  ThunderSuitable: number;
  move: number;
  jump: number;
};

const zeroPhysical: Physical = {
  MaxHP: 0,
  MaxMP: 0,
  STR: 0,
  VIT: 0,
  DEX: 0,
  AGI: 0,
  AVD: 0,
  INT: 0,
  MND: 0,
  RES: 0,
  WT: 0,
  StabResistance: 0,
  SlashResistance: 0,
  BlowResistance: 0,
  FireSuitable: 0,
  RockSuitable: 0,
  WaterSuitable: 0,
  IceSuitable: 0,
  AirSuitable: 0,
  ThunderSuitable: 0,
  move: 0,
  jump: 0,
};

type AddPhysical = (left: Physical, right: Physical) => Physical;
const addPhysical: AddPhysical = (left, right) => ({
  MaxHP: left.MaxHP + right.MaxHP,
  MaxMP: left.MaxMP + right.MaxMP,
  STR: left.STR + right.STR,
  VIT: left.VIT + right.VIT,
  DEX: left.DEX + right.DEX,
  AGI: left.AGI + right.AGI,
  AVD: left.AVD + right.AVD,
  INT: left.INT + right.INT,
  MND: left.MND + right.MND,
  RES: left.RES + right.RES,
  WT: left.WT + right.WT,
  StabResistance: left.StabResistance + right.StabResistance,
  SlashResistance: left.SlashResistance + right.SlashResistance,
  BlowResistance: left.BlowResistance + right.BlowResistance,
  FireSuitable: left.FireSuitable + right.FireSuitable,
  RockSuitable: left.RockSuitable + right.RockSuitable,
  WaterSuitable: left.WaterSuitable + right.WaterSuitable,
  IceSuitable: left.IceSuitable + right.IceSuitable,
  AirSuitable: left.AirSuitable + right.AirSuitable,
  ThunderSuitable: left.ThunderSuitable + right.ThunderSuitable,
  move: left.move + right.move,
  jump: left.jump + right.jump,
});

export type AddPhysicals = (physicals: Physical[]) => Physical;
export const addPhysicals: AddPhysicals = (physicals) =>
  physicals.reduce((acc, item) => addPhysical(acc, item), zeroPhysical);
