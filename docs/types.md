
# データ型

```ts
type Side = "FIRST" | "SECOND";

type Charactor = {
  piece: string;  // 駒種キー
  hp: number;    // 体力
  side: Side;
  steps: number; // 順番ポイント(初期0)。小さいほど先に行動
};
// orderはcharactorを持つ配列のindexで代用

type CharactorReference = {
  side: Side;
  piece: string;
};

type DoSkill = {
  type: "DO_SKILL";
  skillKey: string;
  receivers: CharactorReference[]
};
type DoNothing = {
  type: "DO_NOTHING";
};
type Surrender = {
  type: "SURRENDER";
};
type Action = DoSkill | DoNothing | Surrender;

type Turn = {
  datetime: Date;
  actor: CharactorReference;
  action: Action | null;
  charactors: CharactorBattling[]; // 行動適用・死亡除外後の全生存駒。point昇順=次の行動順
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
export type Skill = {
  key: string;
  name: string;
  baseDamage: number;
  receiverCount: number;
  additionalWt: number;
  effectLength: number;
  reachLength: number;
  description: string;
};

export type Piece = {
  key string;
  name: string;
  MaxHP: number;
  move: number;
  skills: Skill[];
};
```

