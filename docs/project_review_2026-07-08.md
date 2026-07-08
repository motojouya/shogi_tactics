# 将棋タクティクス プロジェクト総合レビュー

- 実施日: 2026-07-08
- 対象: feature/total_review ブランチ(コミット 383f952 時点)
- 方法: 6観点(目的・機能デザイン / ゲームロジック / アーキテクチャ / コード品質・UI / テスト・CI / セキュリティ)の並列調査 + 検証コマンド実行。主要指摘はコードを直接再確認済み。

---

## 1. 総評

**プロジェクトの土台は非常に健全。** 「タクティクスオウガ風ゲームを物理将棋盤で遊ぶための補助アプリ(HP・ターン管理のみアプリが担う)」というスコープ設定が明確で、実装がその設計に厳密に一致している(Unitが盤上座標を持たない、盤面UIを作らない)。model層の純粋性・不変性・エラーを値で返す規約・DIによるテスト容易性・CI/CDのセキュリティ運用は、同規模の個人プロジェクトとして高水準。

一方で、以下の領域に確認・修正すべき問題が残っている。

1. **ゲームデータの不整合**(arrowDodge×rangedSpread、chargeMeleeのコピペ、substituteの範囲定義)— ルールの正しさに直結
2. **運用の穴**(CIチェックと無関係にデプロイが走る、本番構成がどのテストでも検証されない)
3. **機能の未完成部分**(importJsonがUIから到達不能、対戦中の誤入力訂正手段なし、PWAアイコン欠落)
4. **UIの細かい品質**(ロード中の誤表示フラッシュ、文言の日英混在・用語揺れ、ErrorBoundary不在)

セキュリティ上、実害のある脆弱性は確認されなかった。

### 客観的チェック結果(レビュー時に実行)

| チェック | 結果 |
|---|---|
| `npm run test` (vitest) | 15ファイル / 165件 全パス |
| `npm run lint_check` (eslint --max-warnings=0) | 警告0 |
| `npm run format_check` (prettier) | 全ファイル準拠 |
| `npm run build` (tsc -b + vite build) | 成功 |
| `npm audit` | 脆弱性 0件 |

---

## 2. 最優先の指摘(重要度: 高)

| # | 観点 | 指摘 | 根拠 |
|---|---|---|---|
| H1 | ロジック | ~~`arrowDodge`(矢かわし)が軽弓の「遠隔範囲」に効かない~~(対応済み 2026-07-08) | `src/model/action.ts:38,45` / `src/data/action/rangedSpread.ts:13` |
| H2 | 運用 | ~~デプロイが check.yml の成否と無関係に実行される~~(対応済み 2026-07-08) | `.github/workflows/gh-pages.yml` |
| H3 | 機能デザイン | 対戦中の誤入力を訂正する手段がない | `src/model/battle.ts:185-190` / `src/controller/act.ts:22` |
| H4 | UI | ~~ロード中に「〜というbattleは見つかりません」が一瞬表示される~~(対応済み 2026-07-08) | `src/pages/v1/app.tsx:20,35` |

### ~~H1. arrowDodge が rangedSpread に効かない(データ不整合)~~【検証済み】(対応済み 2026-07-08)

~~矢かわしの無効化判定は `reachLength > 2` で行われるが(`src/model/action.ts:38,45`)、`rangedSpread`(軽弓の遠隔範囲)は `reachLength: 2`。rangedSpreadは「2マス先を中心とした範囲」で実際には最大3マス先に届く弓攻撃なのに、矢かわし状態のユニットに通常ダメージが入る。~~

~~- ステータス定義(`src/data/status/arrowDodge.ts`)「近接マス以外からの攻撃が無効」、チュートリアル(`src/guide/tutorial.md:114`)「遠隔攻撃が無効になります」の両記述と矛盾。~~
~~- 同カテゴリの rangedAttack(3)・strongRanged(3)・piercingArrow(5)は正しく無効化される。rangedSpreadだけが例外。~~
~~- spearAttack/strongSpear(reachLength=2)も無効化されない。「槍は矢ではないのでかわせない」意図なら妥当だが、その場合はステータス説明文の修正が必要。~~

> 対応内容(仕様確定): 矢かわしの対象は「弓による攻撃」とし、判定を `reachLength >= 2` に変更(model/action.ts)。槍2種(spearAttack/strongSpear)は弓ではないため `reachLength: 1` に再分類し、「2マス先まで届く」性質は `effectLength: 2` で表現(effectRange/reachRangeは変更なし)。これによりrangedSpread(reachLength=2)は矢かわし対象になり、宝蔵院⇔野伏のバランスは不変。説明文を「弓による攻撃が無効になる」に統一(arrowDodge.ts / arrowDodgeStance.ts / tutorial.md)。境界値テストの更新と、弓分類の全数回帰テスト(data/action/index.unit.test.ts)を追加。テスト183件・lint・buildで確認済み。

### ~~H2. デプロイがCIチェックにゲートされていない~~(対応済み 2026-07-08)

~~main への push で `check.yml`(format/lint/test/build/e2e)と `gh-pages.yml`(デプロイ)が**並列に独立起動**するため、テストが失敗していても本番デプロイは進行する。`gh-pages.yml` に `workflow_run`(check成功後に起動)か、デプロイジョブ内へのテストステップ追加を推奨。~~

> 対応内容: `gh-pages.yml` のトリガーを `push` から `workflow_run`(Check完了時)に変更し、`if` でCheck成功(push起因)のみ実行するよう条件付け。checkoutは検証済みコミット(`workflow_run.head_sha`)を使用。`workflow_dispatch` による手動デプロイは従来どおり可能。

### H3. 対戦中の誤入力を訂正できない

取り消しは編成中の「1手戻し」のみ(`src/controller/undo_unit.ts`)。対戦開始後は `confirm("実行していいですか？")`(`src/controller/act.ts:22`)が唯一の防御。本アプリはHP・行動順の**唯一の記録者**であり、1プレイ30分〜1時間(`src/guide/tutorial.md:6`)の終盤での誤入力はセッションを台無しにしうる。Battleは全ターンを追記型配列で保持しており(`src/model/battle.ts:143-159`)、「直前ターンの取り消し」は構造上実装しやすい。目的に照らして最も欠けている機能。

### ~~H4. useLiveQuery のロード中と not found を区別していない~~(対応済み 2026-07-08)

~~`useLiveQuery` はクエリ解決前に `undefined` を返すため、正当なkeyでも初回レンダーで必ず「〜というbattleは見つかりません」がフラッシュ表示される(`src/pages/v1/app.tsx:20,35`)。`undefined`(ロード中)と `null`(不在)を分岐すべき。`src/pages/list/app.tsx:33` は同じ状況を正しく扱えており、対応が非対称。~~

> 対応内容: `battle === undefined`(ロード中)でloading表示を返す分岐を追加し、not found判定を `battle === null` の厳密比較に変更(src/pages/v1/app.tsx)。build/lint/E2Eで確認済み。

---

## 3. 観点別詳細

### 3.1 目的・機能デザイン

目的(README.md:6-13)と実装の整合性は高い。物理盤の駒管理はプレイヤー、HP/ターン管理はアプリという分担が `src/guide/offscreen.md` に明文化され、実装(Unitに位置情報なし、対戦画面に盤面なし)と一致。ライフサイクル(作成→編成→対戦→決着)に対する機能(作成/編成/1手戻し/行動/降参/一覧/削除/再開)も揃っている。

指摘:

- 【高】対戦中の訂正手段なし(→ H3)
- 【中】**Export/Importが非対称で引き継ぎ手段が実質未完成**: `importJson` はリポジトリ層に実装済み(`src/repository/battle.ts:50-53`)だがUIから呼ぶ箇所がゼロ(デッドコード)。Exportも決着後のみ表示(`src/feature/action.tsx:281-284`)。端末変更・ブラウザデータ消去への備えがなく、対戦中のバックアップも取れない。
- 【中】**Export/ImportがFile System Access API依存**(`src/repository/utility.ts:29-44`): `showSaveFilePicker` はSafari(iOS含む)・Firefox未対応のため、卓上でスマホ/タブレットを使うシーンで動作しない環境が多い。Blobダウンロード方式への変更を推奨。
- 【中】**PWAマニフェストに icons がない**(`vite.config.ts` のmanifest定義)【検証済み】: Chromeのインストール要件(192px/512px)を満たさず、「ホーム画面に追加して卓上で使う」というPWAの目的を損なう。
- 【中】**チュートリアルとUI文言の齟齬**: tutorial.md「バトルの管理」⇔実画面「対戦の管理」(`src/pages/app.tsx:19`)、「バトルをスタート」⇔「戦闘開始」(`src/feature/creation.tsx:133`)、turbulent.md「駒数」⇔「ユニット数」(`creation.tsx:121`)。用語も「対戦/バトル/戦闘」「駒/ユニット」が混在し、フォームラベルは「Mode」「action」「receiver」と英語。
- 【低】バトル一覧の並び順が未定義(uuid列挙順)。日時を表示しているのに日時順でない(`src/controller/list.ts:7-13`)。
- 【低】ガイドMarkdown内リンクが `/shogi_tactics/` プレフィックス直書き(`src/guide/rule.md:13,31` ほか)。base が `/` のローカル開発時はリンク切れ。→ 3.4 の対応案参照。
- 【低】README:26 の「docs/ ドキュメント」は空ディレクトリ(本レポートで解消)。対戦画面見出しが決着後も「戦闘開始」のまま(`src/feature/action.tsx:279`)。「2人が1台の端末を共有する」前提が明文化されていない。

### 3.2 ゲームロジック(src/model, src/data)

不変性の徹底(copyBattle/copyTurn/copyUnit)、status の「次の自分の行動まで」設計(`appendTurn` の clearActorStatuses→act→applyActorCost の順序)、決着判定の網羅(両リーダー同時死亡DRAW、降参、死亡駒の行動順除外)はいずれも正しく、テストで裏づけられている。mutationによる共有状態バグは発見されなかった。

指摘:

- 【高】~~arrowDodge×rangedSpread の不整合~~(→ H1、対応済み)
- 【中】~~**doAct がゲームルールをほとんど検証しない**(`src/model/battle.ts:265-278`): 検証は receiver重複と actionKey存在のみ。以下はUIだけが防波堤。~~(対応済み 2026-07-08)
  - ~~receiverCount超過(meleeAttackに5体渡すと5体にダメージ)~~
  - ~~`action.filter` 未適用 — **hp=0の死亡ユニットをheal対象に渡すと蘇生する**(`src/model/action.ts:69-76` はhpを見ずに `Math.max(unit.hp, maxHp)`)~~
  - ~~決着後でも doAct/doNothing/surrender がターンを追加できる(状態遷移図の「決着済み」防御がモデルにない)~~
  - ~~actor が nextActor か・生存しているかを見ない~~

  > 対応内容: battle.ts に検証を追加し `InvalidArgumentError` を値で返す既存規約で防御。doAct/doNothing は「決着済み」「actorが手番(nextActor)のunitか」を検証(nextActorは生存unitのみから算出されるため死亡actorも弾かれる)。doAct はさらに「receiverCountの上限」「全receiverが action.filter の候補に含まれるか」を検証(死亡unitの蘇生防止)。surrenderBattle は「決着済み」を検証。controller(act.ts/surrender.ts)とUI(action.tsx)にエラー伝搬の分岐を追加し、ガード6件の単体テストを新設(計189件)。テスト・lint・build・E2Eで確認済み。なお編成系API(addFormationUnit等)のガードは指摘7として別途。
- 【中】~~**chargeMelee の name/description が heavyMelee と完全重複**【検証済み】(`src/data/action/chargeMelee.ts:7-8`): 違いはkeyとcost(7 vs 2)のみ。UIでは「近接強撃(コスト7)」と「近接強撃(コスト2)」が同名で並ぶ。桂馬用の技名のコピペ漏れの可能性が高い。~~(2026-07-08 オーナー確認: 意図的な仕様のため対応不要)
- 【中】**substitute の reachLength:0 と reachRange の不整合**(`src/data/action/substitute.ts:13,19-27`): 他の自己対象アクション(arrowDodgeStance等)は中心のみだが、substituteだけ隣接4マスにも到達可の行列。healing.tsからのコピペ疑い。reachRangeはアクション表として表示されるためどちらかが誤り。
- 【中/要仕様確認】**spearAttack/strongSpear の receiverCount:2 と説明文の不整合**: 説明「2マス先まで届く攻撃」に対し受け手2体選択可・2体ともダメージ。effectLength=1 とも食い違う。貫通仕様なら piercingArrow と表現を揃えるべき。
- 【低】`arrayLast` の型の嘘(`src/model/battle.ts:31`): 戻り値 `T` 実際は `T | undefined`。`battleSchema` は `turns: []` を許容するため、保存データ経由で `turns[0]` アクセスがTypeErrorになる経路が存在。
- 【低】~~編成系API(`addFormationUnit`/`undoFormationUnit`)に状態遷移ガードなし。対戦開始後でも編成turnを書き換え可能。unitCount上限・手番チェックもUI側のみ。~~(対応済み 2026-07-08)

  > 対応内容: addFormationUnit に「編成中のみ」「手番のside(nextFormationSide)のみ」「同一駒の重複不可」のガードを追加(上限到達は手番ガードで弾かれる)。undoFormationUnit に「編成中のみ」「空編成では不可」のガードを追加。いずれも `InvalidArgumentError` を値で返し、controller(add_unit.ts/undo_unit.ts)がsaveせず伝搬する。既存テストを手番ルール(先手→後手の交互)に沿ったフィクスチャに修正し、ガードテストを追加(計195件)。あわせてE2Eの手番間待機を300ms→1000msに延長(保存→liveQuery反映前に次の手を打つレースの解消)。テスト・lint・build・E2E(2回連続)で確認済み。
- 【低】`effectHeal` のresolver欠損時サイレントno-op(`src/model/action.ts:72`)。他所の DataNotFoundError 方針と不一致。
- 【低】`simulate` は `clearActorStatuses` を通さないため、actor自身をreceiverにした場合プレビューと実行結果がズレ得る(`src/model/battle.ts:289-297`)。
- 【低】error.ts のエラークラスが `Error` 非継承。stackが取れず、テストの判別方法(`"message" in result`)が脆い。
- 【低】`Action.effectLength` はどこからも参照されない死にフィールド。値の狂いに気づけない温床。
- 【低】プレイヤー名が空白のみでも通る(`validateBattleArgs` にtrimなし)。
- 【低】**単体テストのコードが型検査されていない**【検証済み】: `tsconfig.app.json:28` が `src/**/*.unit.test.ts` を exclude しており、テスト内のUnitリテラルに必須の `leader` がない等が露見しない。tsconfigにテスト用プロジェクトを足すか、vitestのtypecheck機能の導入を推奨。

要仕様確認(バグと断定できないが意図の明文化を推奨):

- `puppet`: 「味方に通常行動をさせる」仕様に対し実装は常に固定1ダメージ。操られた味方のstatusesもクリアされない。
- `barricade`: actが「自分に0ダメージ」の実質no-op。柵のHP管理はアプリ外(物理盤)前提なら整合するが意図が読めない。
- `heavyMelee`: cost2/攻撃2 は「基本技=cost2/攻撃1、強撃=cost7/攻撃2」の体系から外れる(王将の意図的バランスの可能性)。

### 3.3 アーキテクチャ・内部構造

全importの機械抽出により検証。**逆流依存ゼロ・ランタイム循環ゼロ**で、READMEのレイヤ設計(pages→feature→controller→form/model/repository)はおおむね忠実に実装されている。model は zod 以外の外部依存がなく、`Resolvers` による依存性逆転、`local.ts` による副作用(confirm/alert/uuid/Date/遷移)の一元管理も正しい。

```
pages ──→ feature ──→ controller ──→ form ──→ model
  │          │             │           │(!)      ▲
  ▼          ├→ form       ▼           ▼         │
components ──┴→ model    repository ──→ data ────┘
  └→ repository(!)          ▲
       form/feature/pages から直接参照あり(!)   ※(!)= 設計図に無いエッジ
```

指摘:

- 【中】**form → repository 依存**(`src/form/action.ts:3-4`, `src/form/formation.ts:2`): UI向け型 `SelectOption` が `src/repository/utility.ts:59-62` に定義されているのが原因。型の置き場所が逆(formまたはcomponents側に移すべき)。`Repository["piece"]` も model の `Resolvers` 型で受ければ依存が消える。
- 【中】**pages → controller 直結**: list画面だけ feature が存在せず、一覧画面の実装が `src/pages/list/app.tsx` に直接書かれている。他画面と非対称。
- 【中】**レイヤ規約を強制する仕組みがない**: eslint に `no-restricted-imports` 等の境界ルールがなく、逸脱はレビュー頼み。lint での強制を推奨。
- 【中】**Dexie技術のUI層への漏れ**: `useLiveQuery` を pages が直接 import(`src/pages/v1/app.tsx:4`, `src/pages/list/app.tsx:11`)。repository層に `useBattle(key)` 的フックを用意すれば隠蔽できる。
- 【中】**マイグレーション戦略が3系統あり暗黙的**: Dexie `version(1)` / zodの `default`・`coerce` による形状互換(`src/model/turn.ts:43-44`)/ アプリレベルの `battle.version`(pages/v1で照合)。「スキーマ進化はzodで吸収する」方針自体は合理的だが文書化されていない。
- 【中】**MPA×precacheの末尾スラッシュ構造問題**: `/list`(スラッシュなし)はprecacheにマッチせず `navigateFallback` でルートの index.html が表示される。現状「末尾スラッシュ必須」の運用規律で回避しているが脆い。`workbox.navigateFallback: null` で404にして事故を顕在化させる等の構造的対処を推奨。
- 【低】feature → repository 直結(`src/feature/action.tsx:52` の `createResolvers`)、pages → repository 直結(`src/pages/guide/piece/app.tsx:6`)。
- 【低】`createBattleRepository` が呼ばれるたび `new BattleDB()`。StrictModeでは2接続開く。モジュールスコープのシングルトン化が素直。
- 【低】README:22 `.github/workflow/` は実体 `workflows/`。`src/public/` がREADMEのディレクトリ一覧にない。
- 【低】model内の型only循環(action→unit→piece→action)。`verbatimModuleSyntax` によりランタイム循環はなし。許容範囲。

### 3.4 コード品質・UI実装

strict TypeScript で全体の規律は良好。`any` は実質 `src/feature/action.tsx` の1ヘルパーに限定、非nullアサーションはエントリポイント定型のみ。内部リンクの末尾スラッシュは**全数確認で欠落ゼロ**。

指摘:

- 【高】~~useLiveQuery のロード中フラッシュ~~(→ H4、対応済み)
- 【中】**ErrorBoundaryが一切ない**: レンダー中の例外・`useIO` のthrow・JSON.parse失敗はすべて真っ白な画面になる。各ページの createRoot 直下に最低1つ推奨。
- 【中】**Exportボタンのキャンセルで未処理rejection**(`src/feature/action.tsx:282`): `showSaveFilePicker` のキャンセルは `AbortError` をthrowするが誰もcatchしない。また第2引数 `''` のため保存ファイル名が「.json」になる。
- 【中】**リストのkeyにindexを使用**: 削除機能のある一覧で `key={battle-${index}}`(`src/pages/list/app.tsx:34`)はstate誤引き継ぎの典型。`battle.key` を使うべき。`src/feature/action.tsx:341` 付近もソート順変更でAccordion開閉stateが別ユニットに付け替わり得る。
- 【中】**BattleIO 初期化effectの問題**(`src/components/battle_io.tsx:12-16`): クリーンアップなしでStrictModeだとDexie接続が2つ生成され片方開きっぱなし。`createRepository()` rejectのcatchもなく失敗時は永遠に `loading...`。
- 【中】**`getReceiverError` の過剰実装**(`src/feature/action.tsx:60-78`): `errors.receivers?.[index]?.value` で型安全に到達でき、asキャスト2回+any2回+eslint-disable 3行の20行が丸ごと不要。
- 【中】**simulated state の手動インデックス同期**(`src/feature/action.tsx:202,247-270`): フォーム値から導出できる情報を別stateに複製し添字で暗黙同期。`useWatch`+`useMemo` での導出が壊れにくい。関数名 `addReceiver` も実態(プレビュー計算)と乖離。
- 【中】**doActionFormSchema のエラーが英語のまま表示**(`src/form/action.ts:11-14`): zodデフォルトメッセージがFormHelperTextに出る。creation.ts は日本語メッセージ付きで不統一。receiver重複もフォーム側でsuperRefineすれば confirm 前に弾ける。
- 【中】**文言の日英混在**: `loading...`(battle_io.tsx:19)、`actor not found`(action.tsx:221)、`Cancelされました`(act.ts:23)、ボタン `Export`、ラベル `action`/`receiver`。
- 【中】**urlPrefix前置ロジックが3箇所に重複**(`src/components/utility.tsx:17-20,32-35`, `src/repository/local.ts:19-22`): `withPrefix` 関数への集約を推奨。集約すれば markdown.tsx の `a` コンポーネントで内部リンクにprefixを適用でき、3.1のガイド内リンクのハードコード問題(md側は `/guide/...` と書く)も同時に解消できる。
- 【中】**戻る矢印リンクにアクセシブルネームなし**(`src/components/utility.tsx:60-63`): `aria-label="戻る"` を付与すべき。
- 【低】デッドコード: `local.notice`(型と実装も不一致)、`importJson`(UI未配線)、`CopyFailError`(常にnullを返し一度も生成されない)。
- 【低】「駒名（将棋名）」フォーマットが4箇所に重複(label.tsに集約可)。`form/action.ts` の `sideLabel` は `label.ts` の `sideMark` と重複。
- 【低】`html lang` が index/v1/list は `en`、guide配下は `ja` と不統一。list/v1 の `<title>` がトップと同一。`h1` がどのページにもない。
- 【低】`value.slice(0, index) as Side`(`src/form/action.ts:20`)の未検証キャスト。`sideSchema` で実行時検証を。
- 【低】`createMemoryRepository` の `get` が型 `T | null` に対し `undefined` を返す(`src/repository/utility.ts:52`)。
- 【低】formation.tsx Checkboxの表示値とフォーム値の乖離(`checked={field.value && !currentSideHasLeader}`、formation.tsx:115)。
- 【低】surrender の戻り値・Promise失敗が無視される(`src/feature/action.tsx:135-139`)。save失敗時に無反応。
- 【低】`Piece.MaxHP` だけPascalCase。`battle_status.tsx` に関連の薄い2コンポーネントが同居。テーマ無視のハードコード色 `#000000`(utility.tsx:27)。

### 3.5 テスト・CI・品質保証

ロジック層のテスト対応は模範的: model/controller/form の実装ファイルは全件テストあり(未テストは型定義・静的データ・UI層のみ)。テストの質も高い — 境界値の両側検証、異常系、非破壊性の明示テスト、過去バグの回帰テスト(healCap)、DIによるモックライブラリ不要のスタブ注入。

テストカバレッジの穴:

| 領域 | 状況 |
|---|---|
| model / controller / form | 全ファイルテストあり(質も高い) |
| repository(7ファイル) | **全て無テスト**。utility.ts の純粋関数(parseJson等)はすぐテスト可能 |
| data/action 個別値 | index.unit.test.ts が構造(行列形状・actorマス一意性)を全数検証。cost/damage等の値は未固定 |
| components / feature / pages | コンポーネントテストの仕組み自体が未導入 |
| Export/Import | 単体・E2Eとも全レイヤで無検証 |

指摘:

- 【高】~~デプロイがCIにゲートされていない~~(→ H2、対応済み)
- 【中】**E2Eがdevサーバ相手で本番構成を検証しない**(`playwright.config.ts:22` の webServer が `npm run dev`): 本番ビルド・Service Worker・base path(`VITE_URL_PREFIX`)がどのテストでも一度も実行されない。過去の本番バグ2件(SWキャッシュ、末尾スラッシュ)はまさにこの構成差分で発生しており、現構成では再発を捕捉できない。`vite preview` + `VITE_URL_PREFIX` で本番相当を叩くジョブを推奨。
- 【中】**PWAオフライン・リロード跨ぎ永続化のE2Eがない**: `context.setOffline(true)` や `page.reload()` で検証可能。SWキャッシュは再発リスクが最も高い領域。
- 【中】**E2E失敗時の証跡が残らない**: `trace: "on-first-retry"` × retries未設定(=0)でトレースは永遠に取られず、CIへのアーティファクト保存もない。`retries: process.env.CI ? 1 : 0` + `actions/upload-artifact` を推奨。
- 【中】カバレッジ計測・閾値がない(repository層全体が無テストである事実が可視化されない)。
- 【低】**prettierの対象に `.tsx` が含まれない**(`package.json:18,20` は `'src/**/*.ts'` のみ): UI層17ファイルが format_check をすり抜けている。
- 【低】`isSettlement` の「リーダー死亡だが非リーダー生存」分岐が単体テストでは全滅ケースと区別されていない(battle.unit.test.ts の全ユニットが leader: true)。
- 【低】E2Eの `waitForTimeout(300)`、全ダイアログ自動承認、3ステップ単一test構造は flaky・原因切り分け遅延の温床。
- 【低】vitest実行に `--root=.` の打ち消しが必要な構成(vite.config.ts の `root: "src/pages"` との衝突)。vitest.config.ts への分離が事故りにくい。

良い点: CIは format/lint(--max-warnings=0)/test/build(型チェック込み)/e2e の5ジョブが揃い、actionsのSHAピン留め・`persist-credentials: false`・Node固定・`npm ci` と運用が堅い。デプロイも毎回ソースからビルドする健全な構成(dist/ は .gitignore 済みでローカル残骸のみ)。

### 3.6 セキュリティ・依存関係

**実害のある脆弱性は確認されなかった。** 外部通信ゼロ(fetch/XHR/WebSocket不使用をコードで確認)、`dangerouslySetInnerHTML`/`eval` 不使用、ユーザー入力の表示は全てReactのエスケープ経由、IndexedDB・インポートJSONは必ずzod検証を通ってからmodel層へ。`npm audit` 0件。

指摘:

- 【中】**react-markdown のデフォルトURLサニタイザを無効化**(`src/feature/markdown.tsx:59` の `urlTransform={(value) => value}`): `javascript:` スキーム除去が効かなくなっている。現状コンテンツはリポジトリ内静的mdのみで実害はないが、将来ユーザー入力由来の文字列をmarkdown描画した瞬間XSSになる。`diagram:` スキームだけ追加許可する形に修正推奨:
  ```tsx
  urlTransform={(url) => url.startsWith('diagram:') ? url : defaultUrlTransform(url)}
  ```
- 【低】`importJson` の `JSON.parse` が未ガード(`src/repository/battle.ts:51`): 構文エラーは `JsonSchemaUnmatchError` にならず未捕捉例外。UI配線時にtry/catchを。keyが既存battleと衝突すると `put` で上書きされる点も配線時に要検討。
- 【低/参考】CSPなし。GitHub Pagesはヘッダ設定不可だが `<meta http-equiv>` で `script-src 'self'` 等を宣言すれば多層防御になる。
- 【低/参考】CIの `npm ci` が依存のlifecycleスクリプトを実行(サプライチェーン露出点)。バージョン完全固定+dependabot cooldownで大きく軽減済みだが、`--ignore-scripts` も検討余地。
- 【低/参考】`transit` へのkey埋め込みがURLエンコードなし(`src/feature/creation.tsx:47`)。現状は内部生成uuidのみで安全。`battleSchema` の key に形式制約(uuid)を付けるとより堅い。

良い点(特筆): GitHub Actionsの運用が模範的 — 全サードパーティactionのフルSHAピン留め+バージョンコメント、最小権限 `permissions`、`persist-credentials: false`、`pull_request_target` 不使用。dependabotは npm/github-actions 両対応で cooldown(major 30日/minor 7日/patch 3日)設定済み。依存は完全バージョン固定+`only-allow npm`。

---

## 4. 良い点(全観点総括)

1. **目的→設計→実装の一貫性**: 「アプリ必須の要素だけをアプリ化する」スコープが offscreen.md に明文化され、実装が厳密に一致。
2. **model層の純粋性**: 外部依存zodのみ、全関数イミュータブル、`Resolvers` による依存性逆転。逆流依存ゼロ・ランタイム循環ゼロ。
3. **副作用の一元管理とテスト容易性**: window系APIを `local.ts` でRepository化し、controllerが純粋関数に。model/controller/form 全件にテストが同居。
4. **エラーを値で返す規約の一貫性**: model→controller→feature まで `instanceof` 分岐で統一。握りつぶしなし。
5. **直列化境界の設計**: 保存対象はzodスキーマ、関数を含むマスタはkey参照という区別が正確。旧データ互換(`default(0)`)、サロゲートペア対応など境界への配慮。
6. **テスト文化**: 境界値の両側検証、非破壊性テスト、回帰テストのコメント付き固定化、データの全数構造検証。
7. **CI/CD・依存管理のセキュリティ運用**: SHAピン留め、最小権限、cooldown付きdependabot、完全バージョン固定。
8. **「なぜ」を残すコメント**: vite.config.tsのSWキャッシュとhashの関係、Rules of Hooks配慮、座標実測の経緯など、判断理由が残っている。

---

## 5. 推奨対応順

1. **すぐ直す(小さく実害または本番リスク)**
   - ~~H2: gh-pages.yml を check 成功にゲート~~(対応済み)
   - ~~H4: v1画面のロード中/not found分岐~~(対応済み)
   - ~~H1: rangedSpread の reachLength(仕様確認の上)~~(対応済み: しきい値>=2化+槍の再分類)
   - chargeMelee の name/description 修正、substitute の reachRange 修正
   - markdown.tsx の urlTransform を defaultUrlTransform ラップに
2. **次に(機能の完成度)**
   - H3: 対戦中の直前ターン取り消し機能
   - importJson のUI配線(またはexport含め機能ごと削除の判断)+ Blobダウンロード方式化 + PWA icons追加
   - ErrorBoundary導入、Exportキャンセルのcatch
3. **継続的に(構造・保守性)**
   - E2Eの本番相当構成(preview + VITE_URL_PREFIX)ジョブ追加、trace/retries設定
   - tsconfigのテストコード型検査、prettier対象に .tsx 追加
   - SelectOption の置き場所移動(form→repository依存の解消)、レイヤ規約のlint強制
   - 文言の統一(日英混在・用語揺れ・チュートリアルとの一致)
4. **仕様の明文化(コードでなくdocsへ)**
   - 槍・puppet・barricade・heavyMelee の意図
   - マイグレーション方針(Dexie version / zod default / battle.version の使い分け)
   - 「2人が1台の端末を共有する」前提
