# リファクタリング分析 (step15 向け)

## このドキュメントについて

step13/14(ディレクトリ統廃合・repository 一元化)完了時点の `src/` 全コードを精読し、**構造的に修正したほうがよい箇所**と**役割が曖昧なモジュール**を洗い出したもの。
タスク化・優先順位の最終判断は別途行う前提で、ここでは「現状の問題」と「整理の選択肢」を提示する。各項目に `file:line` と優先度(高/中/低)を付す。

現状のレイヤ構成:
```
model (ドメイン) → repository(型) のみ依存
repository (永続化/環境provider)
controller (薄いorchestration)  form (フォーム⇄ドメイン変換)
components / pages (presentation)  data (静的データ定義)
```

---

## 1. 全体評価

- **model/turn・battle・normal_mode、repository 層はクリーン**。ドメインロジックは `battle.ts` に正しく凝集し、controller は薄い。step13/14 のレイヤ整理は概ね機能している。
- 問題は **(a) ごく一部の model のレイヤ違反、(b) ゲームルールが presentation(formation/form)に漏れている、(c) バリデーションの分散と欠落** に集中する。
- 「座標依存ロジックは実装せず説明メタdata」という step4 の設計判断により、一部フィールドは意図的な no-op。これは設計どおりで問題ではないが、**どれが実ロジックでどれが表示専用かが型上で区別されていない**点は可読性の課題(後述4.7)。

---

## 2. 構造的な問題(優先度: 高)

### 2.1 model → repository の型依存 / `getSelectOption` が実質 dead code
- `model/unit.ts:1` が `SelectOption` を `repository/utility` から import している(**model→repository の逆方向依存**。13-2 で顕在化を記録済み)。
- これを使うのは `getSelectOption`(`model/unit.ts:45-49`)のみ。さらに **`getSelectOption` は production から一切呼ばれておらず、参照は `model/unit.unit.test.ts` だけ**(検証済み)。つまり実質 dead code。
- `selectUnit`(`model/unit.ts:53-58`)は `form/battle.ts:66` で使用中だが、これは文字列パースのみで `SelectOption` に依存しない。
- **整理の方向**: `getSelectOption` を削除すれば `SelectOption` import(レイヤ違反)も同時に消える。`selectUnit`(`${side}:${piece}` のパース)は UI フォーム値の解釈なので、model に残すか `form/` 側へ寄せるか選択。あわせて `sideLabel`(`model/unit.ts:42`、getSelectOption 専用の private)も消える。
- 効果: model がドメイン純粋に戻り、`model → repository` 依存が解消する。

### 2.2 `controller/simulate.ts` がドメインロジック
- `controller/simulate.ts` は `copyTurn` で Turn を複製し `action.act(...)` を適用して生存判定する純然たるドメイン計算(`components/battle.tsx` の受け手選択プレビューから呼ばれる。controller の orchestration ではない)。
- **整理の方向**: `model/action.ts`(または新規 `model/simulation.ts`)へ移し、`components/battle.tsx` は model から import。`controller/simulate.ts` は廃止。controller 層を「ユーザ意図→model→repository」の薄い層に揃えられる。

### 2.3 `formation.tsx` にゲームルールが埋め込まれている + 駒重複バリデーション欠落
- `components/formation.tsx:35-55` に**ゲームルールが React component 内に直書き**:
  - 先手/後手の交互順の算出(`currentSide`、:43-46)
  - 大将ちょうど1体の検証(`firstLeaderCount`/`secondLeaderCount`、`done` 条件、:38-55)
  - これらは「編成が完了・有効か」を決めるドメイン規則。`model/battle.ts` の `isSettlement`(:104-105)は leader 生存を見るが、**編成中の有効性検証は model に無い**。
- **駒重複バリデーションが欠落**: `addUnit`(`formation.tsx:60-75`)は同じ陣営に同じ駒を二重追加できてしまう(`docs/02_function.md` step15 でも「unitに駒が重複しないように」と予告済み)。
- **整理の方向**: `model/` に編成検証(例 `validateFormation(units, unitCount)` → 次の手番/完了判定/エラー、`validateUniqueUnit(units, side, piece)`)を新設し、formation はそれを呼ぶだけにする。テスト(`normal_mode.unit.test.ts` 等)に重複・大将数のケースを追加。

### 2.4 `healCap` のハードコードと **promotedLance の実バグ**
- `model/action.ts:73-76` の `healCap`(回復上限)は循環依存回避のため `piece === "king" ? 2 : 3` とハードコード。FIXME 済み。
- **検証の結果これは潜在バグを生んでいる**: `promotedLance`(傀儡師)の `MaxHP=2`(`data/piece/promotedLance.ts:9`)だが、`healCap` は king 以外を一律 3 とするため **回復で MaxHP=2 を超えて 3 まで回復する**。`healing`(薬師/pawn の技)の filter は `filterAlive`(全生存ユニット対象)なので、**戦乱モードで到達可能な実バグ**。MaxHP=2 は現状 `king` と `promotedLance` の2種。
- **根本原因**: `model/action.ts` が Piece の MaxHP を必要とするが、`data/piece/*` が `Action` 型を import するため `model/action → piece実体` を入れると循環する。
- **整理の方向**(FIXME の通り): MaxHP 解決を境界層へ寄せる。`effectHeal` に対象 Unit の MaxHP(または Piece resolver)を渡す形にし、controller/presentation で `pieceRepository.get(unit.piece).MaxHP` を供給する。ハードコードと king/promotedLance のデータ二重管理を解消できる。

---

## 3. 役割が曖昧なモジュール(優先度: 中)

### 3.1 `form/battle.ts` が3つの責務を混在
`form/battle.ts` は以下を1ファイルに同居させている:
1. **フォーム schema**: `doActionFormSchema`(zod、:23-27)— form の正当な責務。
2. **表示整形**: `receiverSelectOption`(:32-39)— 受け手の label/value 生成。presentation 寄り。
3. **ドメイン検証**: `toAction`(:44-70)内の受け手重複チェック(:60-62、`ReceiverDuplicationError`)・action key 存在チェック。重複不可は「同じ unit を二重に対象にできない」というドメイン規則。
- **整理の方向**: form 層は「フォーム値 ⇄ ドメイン型の変換 + schema」に絞り、(2)の表示整形は component/utility へ、(3)の受け手重複は `model/action.ts` の検証関数へ寄せる。`ReceiverDuplicationError` の置き場所(form かドメインエラーか)も再検討。

### 3.2 battle 作成フォーム(`pages/new/app.tsx`)の手書きバリデーション
- `pages/new/app.tsx:42-97` は player 名・stepBase・unitCount を **手書きの if と `Number.isNaN`** で検証。一方 `components/battle.tsx` は zod resolver を使う。検証方式が画面ごとにバラバラ。
- **整理の方向**: 作成フォーム用の zod schema を `form/` に新設し、`@hookform/resolvers/zod` で統一。通常/戦乱モードの分岐(:54-96)も関数抽出の余地。

### 3.3 `components/utility.tsx` に routing が同居
- `components/utility.tsx` は presentation(`Container`/`Header`/`Link`/`ButtonLink`)と **routing(`transit`:17、`getSearchParams`:28)** が同居。`transit`/`getSearchParams` は `window.location` 操作で presentation ではない。
- **整理の方向**: routing ユーティリティを別ファイル(例 `components/routing.ts` か `repository` 寄り)へ分離するか、役割名を明確化。優先度は低めだが「役割が曖昧」の一例。

### 3.4 バリデーションの分散(全体像)
現状、検証ロジックが層をまたいで散在している:

| 検証 | 現在地 | あるべき層 |
|---|---|---|
| player 名必須 | `pages/new/app.tsx:47-52`(手書き) | form schema |
| stepBase/unitCount ≥1 | `pages/new/app.tsx:74-82`(手書き) | form schema |
| 大将ちょうど1体 | `components/formation.tsx:51-55` | model |
| 駒重複(陣営内) | **無し** | model |
| 受け手重複 | `form/battle.ts:60-62` | model |
| action key 存在 | `form/battle.ts:50-53` | form(form→domain変換時の解決として妥当) |
- **整理の方向**: ドメイン規則(大将数・駒重複・受け手重複)は model に集約、入力形式(必須・数値)は form schema に集約、という二分で整理する。

---

## 4. 重複・dead code・小さな整理(優先度: 低)

### 4.1 `sideLabel` が4箇所に重複(表記2種)
- `model/unit.ts:42`(`先`/`後`)、`form/battle.ts:28`(`先`/`後`)、`components/battle.tsx:59`(`先手`/`後手`)、`components/formation.tsx:21`(`先手`/`後手`)。短縮形と通常形の2バリエーション。
- model/unit.ts のものは dead な `getSelectOption` 専用(2.1で消える)。残り3つを共通化候補だが、**`先`/`後` と `先手`/`後手` の使い分け**は意図的な可能性があるため統合時に表記を確認。

### 4.2 `data/action/*` の range 配列の重複
- `reachRange`(7×7)・`effectRange`(3×3)が近接系(reachLength=1)・遠隔系(=3)・槍系(=2)でほぼ同一配列としてファイル間に重複(18ファイル規模)。
- **整理の方向**: `data/action/` に共有定数(例 `REACH_MELEE` / `REACH_RANGED` / `REACH_SPEAR`)を切り出して参照。これらは表示専用メタなのでロジック影響なし。

### 4.3 `Piece.move` は未使用(dead)
- `model/piece.ts` の `move` は各 `data/piece/*` で値が入るが、**model/data 全体で一度も参照されない**(検証済み)。将来の移動メカニクス用のプレースホルダと思われる。削除するか、用途をコメントで明示するか。

### 4.4 `DO_NOTHING` の間接 re-export
- `model/turn.ts:6` の `ORDER_DO_NOTHING` を `form/battle.ts:13-14` で `DO_NOTHING` として再 export。実害は無いが定数の出所が分かりづらい。1本化を検討(低)。

### 4.5 一覧の delete ボタン未実装
- `pages/list/app.tsx:54` の Delete ボタンは `console.log('Not Deleted! TODO!')`。`battleRepository.remove(key)` を呼ぶ実装が未着手。

### 4.6 `version='v1'` のハードコード重複
- `pages/new/app.tsx:39`(作成時)と `pages/v1/app.tsx:13`(表示ガード)で `'v1'` がそれぞれハードコード。共有定数化の余地(低)。

### 4.7 `components/battle.tsx` の `BattleTurn` 肥大 / メタの実ロジック・表示の混在
- `BattleTurn`(`battle.tsx` 後半 ~170行)が form 設定・action 選択・simulate・submit・行動順表示を1コンポーネントに抱える god component 気味。`BattleActionForm` / `BattleActionOrder` 等への分割候補(機能上は問題なし)。
- `Action` 型(`model/action.ts:13-28`)は**実ロジックと表示専用メタが混在**: 実ロジック=`act`/`filter`/`baseDamage`/`cost`/`receiverCount`(フォーム項目数)/`reachLength`(遠隔判定 :43 で使用)。表示専用=`effectLength`/`effectRange`/`reachRange`/`name`/`description`。型コメントで区別はあるが、構造での分離はされていない(可読性の課題。優先度低)。

---

## 5. 良い点(維持したい設計)

- `model/turn`・`battle`・`normal_mode` はドメイン純粋(I/O・React 非依存)。`spendTurn`(状態遷移)・`isSettlement`(勝敗)などゲームロジックが正しく凝集。
- `repository/` は永続化(Dexie)と環境provider(local)を抽象化し、`index.ts` で1オブジェクトに集約・context DI(14完了)。
- controller(`start`/`act`/`surrender`)は薄い orchestration(`simulate` を除く)。
- `Action` の `buildAction`(self 参照を吸収する factory、:121-126)と effect/filter の factory パターンは一貫性がある。
- 駒/技/状態が `data/` の静的定義 + memory repository で素直に分離。

---

## 6. 提案サマリ(優先度マトリクス)

| # | 内容 | 種別 | 優先 | 主な対象 |
|---|---|---|---|---|
| 2.1 | `getSelectOption` 削除 → `SelectOption` のmodel→repository依存を解消 | 構造 | 高 | `model/unit.ts` |
| 2.2 | `simulate` を controller→model へ移動 | 構造 | 高 | `controller/simulate.ts`→`model/` |
| 2.3 | 編成ルール(交互順/大将1体)と駒重複検証を model へ | 構造 | 高 | `formation.tsx`→`model/` 新規検証 |
| 2.4 | `healCap` ハードコード解消(MaxHP を Unit/Piece から供給)。promotedLance 回復バグ修正 | 構造/バグ | 高 | `model/action.ts` |
| 3.1 | `form/battle.ts` の責務分離(schema / 表示 / ドメイン検証) | 責務 | 中 | `form/battle.ts` |
| 3.2 | 作成フォームの zod schema 化 | 責務 | 中 | `pages/new/app.tsx`, `form/` |
| 3.3 | `utility.tsx` の routing 分離 | 責務 | 中 | `components/utility.tsx` |
| 3.4 | バリデーションを model(ドメイン規則)/ form(入力形式)に二分集約 | 責務 | 中 | 横断 |
| 4.1 | `sideLabel` 共通化 | 重複 | 低 | 横断 |
| 4.2 | range 配列を共有定数化 | 重複 | 低 | `data/action/` |
| 4.3 | `Piece.move` 削除 or 用途明示 | dead | 低 | `model/piece.ts`, `data/piece/` |
| 4.4 | `DO_NOTHING` 間接 re-export の1本化 | 整理 | 低 | `model/turn.ts`, `form/battle.ts` |
| 4.5 | 一覧 delete 実装 | 機能 | 低 | `pages/list/app.tsx` |
| 4.6 | `version` 定数化 | 整理 | 低 | `pages/{new,v1}` |
| 4.7 | `BattleTurn` 分割 / `Action` のメタと実ロジックの構造分離 | 整理 | 低 | `components/battle.tsx`, `model/action.ts` |

> 注: 2.4 の promotedLance 回復バグは構造課題(healCap ハードコード)の副作用だが、**単体のバグ修正としても先行対応可能**(`healCap` に promotedLance を加える/MaxHP 供給に切り替える)。

---

## 7. ユーザー方針(02_function.md step15 memo の反映)

§1〜§6 は精査時点の「現状の問題と選択肢」。本節は `docs/02_function.md` step15 の `#### memo` に記された**ユーザーの決定・追加項目**を、上記分析に紐づけて整理したもの。**選択肢が割れていた箇所はここで方針が確定**しており、§3.1/§3.3/§4.7 など一部は私の推奨と**逆の決定**になっている(各項に明記)。実装の正は本節とする。

### 7.1 model 層へのドメイン集約

- **memory resolver 型を model に定義し、各 repository の `get` を渡す**(§2.4 の解決方針として確定):
  - `model` に `(key: string) => Action | null` / `(key: string) => Piece | null` / `(key: string) => Status | null` の型を定義する。
  - これらを束ねた dictionary を **`repository/index` で memory 3種(piece/action/status)の `get` だけ集めて生成**し、battle の model 関数へ渡す。**型(形)定義は model 側**に置く。
  - これにより model が memory repository 相当を引数で受け取れ、**`action#act` が Piece(MaxHP)を要求する部分(=§2.4 healCap ハードコード/promotedLance 回復バグ)も同じ仕組みで解決**する。`healCap` の `king`/`promotedLance` データ二重管理が消える。
- **`ReceiverDuplicationError`(受け手重複)は model 側の制約として実装**(§3.1/§3.4 で「あるべき層=model」とした項の決定)。「1つずつ追加 / 一気に追加」は画面実装方針が未定のため**今後の検討課題**とし、当面は現状の一気追加のまま。
- **`model/normal_mode.ts` の内容は `model/unit.ts` へ統合**。ただし `NORMAL_UNIT_COUNT` / `NORMAL_STEP_BASE` は **`model/battle` へ**置く。
- **`selectUnit` を form 層へ移動**(§2.1 で「model に残すか form へ寄せるか選択」とした点の決定 → **form 側へ**)。`getSelectOption` 削除(§2.1)と合わせ、model の UI 依存(`SelectOption`)を一掃する。

### 7.2 form 層の再編(ファイル分割・select 解釈の集約)

- **`form/battle.ts` を責務ごとに分割**(§3.1 の具体ファイル名を確定):
  - action 関連 → **`form/action.ts`**
  - unit 編成 → **`form/formation.ts`**
  - battle 作成 → **`form/creation.ts`**
- **`toAction` / `DoActionInput` の見直し**: 現状 form の `toAction` が **model 型 `DoActionInput` を組み立てて返す**のがレイヤとして不適切。方針:
  - model への入力型は model 側に置く。form は**個々の値を取り出す**形にする。
  - **action は repository 経由の解決なので form の責務外**。`spendTurn` に `repository#get`(=7.1 の resolver)を渡すなら、**action 解決は `spendTurn` 側で行う**。
  - したがって form 側は **単に `UnitReference` の list を取得する関数**を用意すればよい(完全な `DoActionInput` の組み立ては不要)。
- **select の option 取得は form に寄せる**(⚠ **§3.1 の私の推奨「表示整形=`receiverSelectOption` を component/utility へ」を変更**)。値の解釈も form の役割なので、option 生成と値解釈を form に集約する方がまとまりがよい、という判断。

### 7.3 controller 層

- **controller は第1引数で `Repository` を丸ごと受け取る**(現状の個別 repo/local を引数で受ける形からの変更)。controller 間でインタフェースが揃い、DI が単純化する。

### 7.4 turn / battle ドメインの再設計

- **`Turn` に `previous: number` を追加**(今後の「巻き戻し」機能のため)。
- **battle の turn は sort しない / `hp:0` のユニットも残す**。行動順・次の actor は**その都度算出**する(現状 `sortedUnits` で並べ替え・死亡除外している方針の見直し)。
- **`spendTurn` の分解**: 現状 `battle#spendTurn` が仮 turn を作り cost 計算まで抱えているロジックを **`Turn` 側へ移す**:
  - actor の cost 消費は `Turn` の仕事にする。
  - `action` は **`Turn` を知らず、`Unit` を受け取ってその Unit の計算だけ**を行う形にする(turn 依存を action から外す)。
  - ※ §2.2(`simulate` を controller→model へ)と連動。ドメイン計算を model の turn/action に正しく再配置する一連の作業。

### 7.5 repository / utility の整理

- **import/export ロジック詳細(`BattleRepository#pickerOpts` 含む)を `repository/utility` に寄せて呼び出す**(repository 内の整理。§4.x 未記載の新規項目)。
- **`components/utility.tsx` の routing(`transit`/`getSearchParams`)を `repository/local` へ移動**(⚠ **§3.3 の私の推奨「`components/routing.ts` か repository 寄り」を `repository/local` に確定**)。`local`(環境 provider)に画面遷移も含める判断。

### 7.6 命名調整(細かい)

- 残存する **`skill` → `action`** へ。
- **repository と model を区別したい文脈では接尾語に `Repository` を付ける**。
- その他、随時。

### 7.7 feature ディレクトリの復活と画面分割(§4.7 の上位方針)

⚠ **13-3 追加対応で削除した `feature/` を復活させる**方針(過去の判断の転換)。理由と形:

- `components/battle.tsx` が肥大しているのは「component ではなく**画面全体**を表現している」ため。**画面表現を `feature/` に移す**ことで緩和する(§4.7 の `BattleTurn` 分割より上位の構造方針)。
- **`pages` から `new` を削除**し、**`/v1` で `key` query string が無いとき `new` を出す**。
- `/v1` に機能が集まるので、**creation(new) / formation / action を出し分け**る(決着済みは別途用意するかもしれない)。
- 出し分け先の実装を **`feature/` に各ファイルで表現**する。

### 7.8 後回し(UI 調整後に判断)

- `pages/*/app.tsx` の細かい実装を component へ寄せるのは、**UI 調整が進んでから**判断する。

### 7.9 方針サマリ(memo 由来の追加・変更)

| # | 内容 | 分析項目との関係 | 区分 |
|---|---|---|---|
| 7.1a | model に memory resolver 型(Action/Piece/Status の `(key)=>…|null`)を定義し repository の `get` を渡す | §2.4 の解決方針として確定 | 確定 |
| 7.1b | `repository/index` で memory3種の `get` dictionary を生成 → battle model へ | §2.4 関連・新規 | 新規 |
| 7.1c | `ReceiverDuplicationError` を model 制約へ(当面は一気追加) | §3.1/§3.4 の決定 | 確定 |
| 7.1d | `normal_mode.ts`→`unit.ts`、`NORMAL_*`→`battle` | 新規 | 新規 |
| 7.1e | `selectUnit` を form へ | §2.1 の決定(form 側) | 確定 |
| 7.2a | `form/battle.ts`→`action.ts`/`formation.ts`/`creation.ts` 分割 | §3.1 の具体化 | 確定 |
| 7.2b | `toAction` は `UnitReference` list 取得へ縮小、action 解決は `spendTurn` | §3.1 の再定義 | 新規 |
| 7.2c | select option 取得を form に集約 | **§3.1 の推奨を変更**(component→form) | 変更 |
| 7.3 | controller 第1引数で `Repository` 丸ごと受け取り | 新規 | 新規 |
| 7.4a | `Turn.previous` 追加(巻き戻し用) | 新規 | 新規 |
| 7.4b | turn を sort しない / `hp:0` 残す / 行動順は算出 | 新規(構造) | 新規 |
| 7.4c | `spendTurn` の cost 計算を `Turn` へ、action は Unit のみ受ける | §2.2 と連動 | 新規 |
| 7.5a | import/export 詳細(`pickerOpts`)を `repository/utility` へ | 新規 | 新規 |
| 7.5b | routing を `repository/local` へ | **§3.3 の移動先を確定**(repository/local) | 変更 |
| 7.6 | 命名: `skill`→`action`、`Repository` 接尾語 | §4 系 | 確定 |
| 7.7 | `feature/` 復活・`/v1` で出し分け・画面表現を feature へ | **§4.7 の上位方針**(feature 削除を転換) | 変更 |
| 7.8 | pages→component の細分化は UI 調整後 | §4.7 関連 | 保留 |
