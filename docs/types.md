
# データ型

```ts
type Side = "FIRST" | "SECOND";

type Unit = {
  side: Side;
  piece: string;  // 駒種キー
  hp: number;    // 体力
  steps: number; // 順番ポイント(初期0)。小さいほど先に行動
  statuses: string[]; // 状態異常キーの配列
};
// orderはunitを持つ配列のindexで代用

type UnitReference = {
  side: Side;
  piece: string;
};

type Formation = { // unitの決定中の状態
  type: "FORMATION";
};
type DoAction = {
  type: "DO_SKILL";
  skillKey: string;
  receivers: UnitReference[]
  actor: UnitReference;
};
type DoNothing = {
  type: "DO_NOTHING";
  actor: UnitReference;
};
type Surrender = {
  type: "SURRENDER";
  actor: UnitReference;
};
type Order = Formation | DoAction | DoNothing | Surrender; // 旧Action

type Turn = {
  datetime: Date;
  order: Order;
  units: Unit[]; // 行動適用・死亡除外後の全生存駒。point昇順=次の行動順
};

type GameResult = "ONGOING" | "FIRST" | "SECOND" | "DRAW";

type Battle = {
  key: string;
  first_player_name: string;
  second_player_name: string;
  stepBase: number;  // 順番ポイントのBASE(=開始時の総駒数。定数。step11)。1以上でないといけない。基本はunit数
  turns: Turn[];     // length===0 はparty作成段階(画面出し分けの条件)
  unitCount: number;
  result: GameResult;
  version: string;
};
```

```ts
export type Status = {
  key: string;
  name: string;
  description: string;
};

// 技の効果を定義する関数
export type Act = (
  actor: UnitReference,
  receiver: UnitReference[],
  turn: Turn,
) => Turn;

// 技を適用するキャラクターの選択肢をFilterする関数
export type Filter = (
  actor: UnitReference,
  turn: Turn,
) => UnitReference[];

// selfはAct/Filterを生成するファクトリ関数のクロージャで閉じ込める
// Act生成: effectBaseDamage(self), effectGrantStatus(statusKey)(self), effectHeal(self), effectOverHeal(self)
// Filter生成: filterActor(self), filterAlive(self)
// 座標依存(範囲/貫通/押出/防柵)・操り人形等はact内では実装せずno-op(説明テキスト扱い)

export type Action = { // 旧skill
  key: string;
  name: string;
  description: string;
  act: Act;
  filter: Filter;
  baseDamage: number;
  receiverCount: number;
  cost: number;
  effectLength: number;
  reachLength: number;
  // 影響範囲の可視化用マス表現。値は10進だが2進で意味を持つ(bit0=影響あり, bit1=Actorのマス)
  // 0=影響なし, 1=影響あり, 2=Actorのマス(影響なし), 3=Actorのマス かつ 影響あり
  effectRange: number[][]; // 対象/着地点を中心[1][1]とした3×3
  reachRange: number[][]; // Actorを中心[3][3]とした7×7(piercingArrowのみActorを2マス下[5][3]へ)
};

export type Piece = {
  key: string;
  name: string;
  description: string;
  MaxHP: number;
  move: number;
  actions: Action[];
};
```

