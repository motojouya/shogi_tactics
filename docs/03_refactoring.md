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
- `model/piece.ts` の `move` は各 `data/piece/*` で値が入るが、**model/data 全体で一度も参照されない**(検証済み)。将来の移動メカニクス用のプレースホルダと思われる。
- **方針: 削除しない(ユーザー決定)**。将来の移動メカニクス用に `move` は残す。本項は dead 指摘の記録のみ。

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
| 4.3 | `Piece.move` は残す(ユーザー決定。将来の移動メカニクス用) | dead | — | `model/piece.ts`, `data/piece/` |
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

---

## 8. 作業順序(依存元 → 依存先)

依存方向 **model → repository → form → controller → component → feature → pages** に沿って上流から修正する。各 step は「上流の変更 + green を保つための直近 caller の最小更新」を1単位とし、**step 完了時に build/test green**(step 内の一時的 red は可)。signature を変える model 系 step では call site を最小限だけ追従させ、presentation の本格的な作り替えは下流 phase で行う(同一 caller を2度触る箇所があるが、green 維持のため意図的)。

### Phase 1 — model
- **S1. model 純化**【済】 — `getSelectOption`+`GetSelectOption`+`sideLabel`(private)削除 → `SelectOption` import 除去(§2.1)、残存 `skill` 命名 `DO_SKILL` → `DO_ACTION`(§7.6一部)。`model/unit.unit.test.ts` の該当ケース削除。⇒ **model→repository 依存が消滅**。`Piece.move` 削除(§4.3)は**ユーザー指示により実施せず(move は残す)**。
- **S2. model 内再配置**【済】 — `normal_mode.ts`(`buildNormalUnits`/`NORMAL_PIECE_ORDER`/`GetPiece`/`BuildNormalUnits`)→ `unit.ts` 統合、`NORMAL_UNIT_COUNT`/`NORMAL_STEP_BASE` → `battle.ts`(§7.1d)。`normal_mode.ts` 削除。`pages/new/app.tsx` の import 付け替え。test は `buildNormalUnits` 系を `unit.unit.test.ts` へ・定数値を `battle.unit.test.ts` へ移設。
- **S3. `Turn.previous` 追加**【済】(§7.4a) — `turnSchema` に `previous: z.number().default(0)`(旧データは parse 時に 0 補完で互換)。意味は「直前 Turn の index(巻き戻し用)」。`copyTurn` と `battle.ts` の Turn 構築4箇所(start=0 / surrender=turns.length-1 / spendTurn working=0 / newTurn=turns.length-1)に反映。テスト fixture は型チェック外かつ未参照のため変更なし。
- **S4. resolver 型定義**【済】(§7.1a/b) — 各 resolver 型を対応する model 型の隣に定義: `GetAction`(`action.ts`)/`GetPiece`(`piece.ts`)/`GetStatus`(`status.ts`)= いずれも `(key: string) => X | null`(repository の memory `get` 型に一致)。束ねる `Resolvers`(`getAction`/`getPiece`/`getStatus`)型を **`model/resolver.ts`** 新設(形は model 側=§7.1b、生成は S8 の repository/index、消費は S6/S7)。S2 で unit.ts に入った旧 `GetPiece`(`=> Piece|null|undefined`)は canonical(`piece.ts` の `=> Piece|null`)へ寄せ、`buildNormalUnits` はそれを利用。型のみ・未使用。
- **S5. 編成・受け手検証を model に新設**【済】(§2.3 / §7.1c) — `model/unit.ts` に編成検証を追加: `nextFormationSide`(先手→後手交互の次手番/完了null)・`sideHasLeader`・`canAddPiece`(陣営内**駒重複**を禁止=§2.3 で欠落していたルール)・`isFormationComplete`(双方 unitCount かつ各陣営 leader ちょうど1体)。`model/action.ts` に受け手重複のドメイン制約 `ReceiverDuplicationError`(model 版)+`validateReceivers`。`formation.tsx`/`form/battle.ts` は**現状ロジックのまま温存**(model 関数の利用切替は S17/S13。form 側の同名 `ReceiverDuplicationError` も一旦併存)。test 11件追加(unit/action)。
- **S6. action の resolver 化 + simulate 移設**【済】 — `controller/simulate.ts` → **`model/simulation.ts`** へ移設(§2.2。test も `model/simulation.unit.test.ts` へ)。`Act` 型に `getPiece: GetPiece` 引数を追加し、`effectHeal` を `getPiece(unit.piece)?.MaxHP` で上限判定する形へ(§2.4 **healCap ハードコード廃止・promotedLance 回復バグ修正**。回帰テスト追加)。`spendTurn`/`simulate` に `getPiece` 引数を追加。call site は当面 `repository.piece.get` を直接渡す(束ね方は S8): `controller/act` に `piece: Repository["piece"]` 引数追加→`spendTurn(…, piece.get, …)`、`components/battle.tsx` は `act(…, piece)` と `simulate(…, piece.get)`。effectBaseDamage/grant/overHeal は getPiece 不使用(3引数のまま Act に代入可)。test 115 pass。
- **S7. spendTurn / Turn 再設計**【済】 — `Act`/`Filter` を **Turn 非依存**化: `Act = (actor, receiver, units: Unit[], getPiece) => Unit[]` / `Filter = (actor, units: Unit[]) => UnitReference[]`(action.ts から Turn/copyTurn import 撤去)(§7.4c)。status 失効・cost 消費を **`turn.ts` へ**移設(`clearActorStatuses` / `applyActorCost`)。`spendTurn` は「status クリア→act(units)→cost 消費→勝敗判定」の薄い orchestration になり、**死亡駒を除外せず・並べ替えもしない**(`Turn.units` は全駒保持。行動順・次 actor は `sortedUnits`/`nextActor` が算出。§7.4b)。caller 追従: `simulation.ts`(act が `Unit[]` 返却)、`components/battle.tsx`(`action.filter(actor, lastTurn.units)`)。test 追従: `action.unit.test.ts` を `Unit[]` API へ全面書き換え、`battle.unit.test.ts` の並び/死亡駒アサートを `sortedUnits` ベースへ。test 115 pass。

### Phase 2 — repository
- **S8. resolver dictionary**【済】(§7.1b) — `repository/index` に **`createResolvers(repository): Resolvers`** を新設。静的関数を別途定義せず、各 memory repository の **`get` メソッド**(`repository.action.get`/`piece.get`/`status.get`)をそのまま束ねる(ユーザー方針: Resolver は Repository のメソッドから取得する)。model 側の orchestration(`spendTurn`/`simulate`)は S6/S7 の `getPiece: GetPiece` 引数を **`resolvers: Resolvers`** に置換し、内部で `resolvers.getPiece` を `action.act` へ渡す(`action.act` の leaf 引数は `getPiece` のまま)。call site: `controller/act` の `piece: Repository["piece"]` 引数を `resolvers: Resolvers` に置換、`components/battle.tsx` は `const resolvers = createResolvers(io)` を作り `act(…, resolvers)`/`simulate(…, resolvers)` へ。test(battle/simulation/act)は `getPiece` stub を Resolvers 束へ更新。build/test 115 pass/lint/format green。
- **S9. import/export を utility へ**【済】(§7.5a) — `repository/battle.ts` の `pickerOpts` と File System Access API の詳細を `repository/utility` に移設。新設 **`importJsonFile(schema)`**(picker→read→`parseJson(schema)`)/ **`exportJsonFile(data, fileName)`**(JSON 文字列化→save picker→write)。`pickerOpts` は utility 内に private 化。`BattleRepository#importJson`/`exportJson` は `importJsonFile(battleSchema)` / `exportJsonFile(battle, fileName)` を呼ぶだけに。build/test 115 pass/lint/format green。
- **S10. routing 移動**【済】(§7.5b) — `components/utility.tsx` の `transit`/`getSearchParams`(+ `VITE_URL_PREFIX` の `urlPrefix`)を `repository/local` へ移設し、**`Local` のメソッド**(`transit`/`getSearchParams`)として追加(ユーザー方針)。`Local` 型/`local` object に両 method を追加。call site: `pages/new`(provider 内)は `useIO().local.transit(...)`、`pages/v1` の `App`(BattleIO provider の外)は `local` シングルトンを直接 import し `local.getSearchParams()`。`components/utility.tsx` は `urlPrefix` を残し(`Link`/`ButtonLink` が使用)、これでファイルの export が全て component になったため先頭の `eslint-disable react-refresh/only-export-components` を撤去。build/test 115 pass/lint/format green。
- **S11. 命名(Repository 接尾語)**【済】(§7.6) — 監査の結果、(1) 残存 `skill` は src から既に一掃済み(S1 完了)、(2) memory repository(`pieceRepository`/`actionRepository`/`statusRepository`)と `BattleRepository` 型は既に接尾語付きで OK。唯一の不統一だった `repository/battle.ts` の factory(汎用名 `createRepository`/`CreateRepository`。index.ts の「全 Repository を束ねる `createRepository`」と概念衝突し別名 import が必要だった)を **`createBattleRepository`/`CreateBattleRepository`** に改名。`index.ts` の `as` 別名 import を解消。`local`/`Local` は provider でありモデル衝突が無いため対象外。build/test 115 pass/lint/format green。**⇒ Phase 2(repository)完了。**

### Phase 3 — form
- **S12. form 分割**【済】(§7.2a) — 現状 `form/battle.ts` の内容は全て action 関連(`DoActionForm`/`doActionFormSchema`/`toAction`/`receiverSelectOption`/`ReceiverDuplicationError`(暫定)/`DO_NOTHING`)だったため、**`form/battle.ts` → `form/action.ts`** へ移設(`mv`、内容は同一・同ディレクトリなので相対 import 不変)。importer を `../form/battle` → `../form/action` に更新(`components/battle.tsx`/`controller/act.ts`/`controller/act.unit.test.ts`)、`model/action.ts` のコメント参照も追従。**`form/formation.ts`/`form/creation.ts` は内容が出る S13(selectUnit/select option 集約)/S14(creation zod)で新設**(空ファイルは作らない方針)。build/test 115 pass/lint/format green。
- **S13. form 責務の集約**【済】(§7.2b/§7.2c/§7.1e) — **`toAction` を解体**(ユーザー方針)。form の責務は「変換が要る値」のみ:
  - `selectUnit`(`"FIRST:king"` → `UnitReference`)を **model/unit.ts → form/action.ts** へ移設(値 string の解釈は form の責務。form→model 依存は可・逆は不可)。テストも `form/action.unit.test.ts` へ移設(コロケーション)。
  - 受け手解決のみ関数化: **`toReceivers(form.receivers): UnitReference[]`**(`selectUnit` で map)。**`actionKey` は model がそのまま扱える値なので関数で包まず controller が直接読む**。
  - `receiverSelectOption`/`DO_NOTHING` は form に残置。
  - form 版 `ReceiverDuplicationError` 暫定 class を**削除し model 版(S5)へ一本化**。`components/battle.tsx` の import を `model/action` へ変更。
  - **controller `act` が組み立てを担う**: `actionKey===DO_NOTHING`→`doAction=null`、それ以外は `toReceivers`→`validateReceivers`(model)で重複検証→`resolvers.getAction(actionKey)` で解決(null は `DataNotFoundError`)→`DoActionInput{action,receivers}` を spendTurn へ。`act` の `action: Repository["action"]` 引数を撤去(resolvers.getAction を使用)、caller(`components/battle.tsx`)と test を追従。`spendTurn`/`DoActionInput` は不変で **model→repository/error 依存を作らない**。build/test 117 pass(+form 2)/lint/format green。
- **S14. creation フォームの zod 化**【済】(§3.2) — `pages/new` の手書きバリデーションを **`form/creation.ts`** の zod schema 化。2モードで必須が異なるため2種を新設: **`normalCreationFormSchema`**(player名のみ必須。stepBase/unitCount は `NORMAL_STEP_BASE`/`NORMAL_UNIT_COUNT` 固定)/ **`warCreationFormSchema`**(player名 + `z.coerce.number().int().min(1)` で stepBase/unitCount を数値化・1以上要求。空文字=0/非数値=NaN はいずれも min(1) 失敗)。型 `NormalCreationForm`/`WarCreationForm` を z.infer で導出。schema 検証の colocation テスト追加。**pages/new への接続(react-hook-form + zodResolver 化)は Phase 7(S20)で実施**(現状の手書き分岐は据え置き)。build/test 122 pass(+creation 5)/lint/format green。
- **S15. `DO_NOTHING` 一本化**【済】(§4.4) — `form/action.ts` の間接 re-export(`export const DO_NOTHING = ORDER_DO_NOTHING`)を廃止し、**`model/turn.ts` の `ORDER_DO_NOTHING` を単一の真実**に。consumer は直接 import へ: `controller/act.ts`(`../model/turn`)/`components/battle.tsx`(`../model/turn` の value import 追加)。`DO_NOTHING` 別名は src から消滅(残るは `ORDER_DO_NOTHING` 定数と schema の `z.literal("DO_NOTHING")` 等の文字列リテラルのみ)。build/test 122 pass/lint/format green。**⇒ Phase 3(form)完了。**

### Phase 4 — controller
- **S16. controller の引数統一**【済】(§7.3) — `act`/`registerBattle`/`startBattle`/`surrender` を **第1引数で `Repository` を丸ごと受け取る**形に統一(従来は `(battleRepository, local)` 等を個別に curry)。内部で `repository.battle`/`repository.local` を分解。`act` は `repository` から **`createResolvers(repository)`** で resolvers を内製(resolvers 引数を撤去)。caller 追従: `components/battle.tsx`(`act(io)`/`surrender(io)`、未使用化した `local` を destructure から除去)、`components/formation.tsx`(`startBattle(io)`)、`pages/new/app.tsx`(`registerBattle(io)`/`startBattle(io)`、`local.transit` 用に `local` は残置)。test 3種は battle+local(+act は piece/action/status)を束ねた `Repository` を渡す形へ更新。build/test 122 pass/lint/format green。**⇒ Phase 4(controller)完了。**

### Phase 5 — component
- **S17. formation.tsx を model 検証へ**【済】(§2.3 消費) — 直書きしていた編成ルールを S5 の model 検証へ委譲: `currentSide`(手番)→ **`nextFormationSide`**、`currentSideHasLeader`(大将1体制限)→ **`sideHasLeader`**、`done`(編成完了)→ **`isFormationComplete`**。`firstLeaderCount`/`secondLeaderCount` の直書き集計を撤去(`firstCount`/`secondCount` は進捗表示用の単純集計として残置)。欠落していた**駒重複ルールを `canAddPiece` で導入し UI に反映**: 選択駒が同陣営に既存なら「この駒を追加」ボタンを `disabled`・「この駒は既に配置済みです」を表示し、`addUnit` も `canAddSelected` でガード。build/test 122 pass/lint/format green。
- **S18. battle.tsx の API 追従 + 小整理**【済】 — API 追従は S6–S16 で逐次完了済み(simulate=model、resolver dictionary=`createResolvers`、form=`form/action`+`toReceivers`、routing=`local.transit/getSearchParams`、controller=`act(io)`/`surrender(io)`、`ORDER_DO_NOTHING`)。本ステップの実作業は **`sideLabel` 共通化(§4.1)**: 通常形(先手/後手・`Side`受け取り)が `battle.tsx`/`formation.tsx` で完全重複していたため **`components/label.ts`** に切り出し両者から import。短縮形(先/後・`UnitReference`受け取り)は receiver select option 専用で表示文脈が異なるため `form/action.ts` 側に据え置き(§4.1 の「表記の使い分けは意図的」を尊重)。`components/utility.tsx` への合流は避けた(全 export が component の状態を保ち react-refresh 警告を出さないため)。creation/list への form schema 適用は **Phase 7(S20/S21)** で実施。build/test 122 pass/lint/format green。**⇒ Phase 5(component)完了。**

### Phase 6 — feature
- **S19. feature 復活と画面表現の移設**(§7.7 / §4.7) — `feature/` を復活し、creation(new)/formation/action(/決着済み)の画面表現を各ファイルへ。`components/battle.tsx` が抱える「画面全体表現」を feature へ移し肥大を緩和。

### Phase 7 — pages
- **S20. pages 出し分け配線**(§7.7) — `pages/new` 削除、`/v1` で `key` query 無し時に new を表示、creation/formation/action を feature で出し分け。
- **S21. 残整理** — list の delete 実装(§4.5)、`version='v1'` 定数化(§4.6)。
- **S22(保留)** — `pages/*/app.tsx` の細部を component へ寄せる(§7.8) は **UI 調整後**に判断。

### レイヤ非依存(任意のタイミング)
- **§4.2 range 配列の共有定数化**(`data/action/`) — data 層で他に依存しないため、いつでも独立実施可。

> 各 step は単独でも green に戻せる粒度に割っているが、S6/S7(model 中核)は signature 変更が広く波及するため、**1 step 内で controller/components の call site 追従まで含める**点に注意。下流 phase(S16〜S20)は同じ caller を「正しい構造へ」作り替える 2 度目の接触になる。
