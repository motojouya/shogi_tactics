
# データ型

```ts
type Side = "FIRST" | "SECOND";

type Charactor = {
  side: Side;
  piece: string;  // 駒種キー
  hp: number;    // 体力
  steps: number; // 順番ポイント(初期0)。小さいほど先に行動
  statuses: string[]; // 状態異常キーの配列
};
// orderはcharactorを持つ配列のindexで代用

type CharactorReference = {
  side: Side;
  piece: string;
};

type Origin = { // 駒の初期配置を表す。ゲーム開始前の状態を定義するために必要
  type: "ORIGIN";
};
type DoAction = {
  type: "DO_SKILL";
  skillKey: string;
  receivers: CharactorReference[]
  actor: CharactorReference;
};
type DoNothing = {
  type: "DO_NOTHING";
  actor: CharactorReference;
};
type Surrender = {
  type: "SURRENDER";
  actor: CharactorReference;
};
type Order = DoAction | DoNothing | Surrender; // 旧Action

type Turn = {
  datetime: Date;
  order: Order;
  charactors: Charactor[]; // 行動適用・死亡除外後の全生存駒。point昇順=次の行動順
};

type GameResult = "ONGOING" | "FIRST" | "SECOND" | "DRAW";

type Battle = {
  title: string;
  first_player_name: string;
  second_player_name: string;
  stepBase: number;  // 順番ポイントのBASE(=開始時の総駒数。定数。step11)
  turns: Turn[];     // length===0 はparty作成段階(画面出し分けの条件)
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
  self: Action, // TODO
  actor: CharactorReference,
  receiver: CharactorReference[],
  turn: Turn,
) => Turn;

// 技を適用するキャラクターの選択肢をFilterする関数
export type Filter = (
  self: Action, // TODO
  actor: CharactorReference,
  turn: Turn,
) => CharactorReference[];

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

