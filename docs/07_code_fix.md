
# コード整理
コードの整理もしたい。component設計、コードコメント削除、modelの責務整理、テストコードの整理など
ディレクトリごとにメモしていく

## /
- [x] コメント削除

## .github/
- [x] コメント削除

## docs/
- [x] develop.mdをREADME.mdに移動

## public/
- [x] ディレクトリごとsrcの配下に移動したい
- [x] public配下の構成が深いので、フラットにしたい

## test/
- [x] コメント削除

## src/data/
- [x] コメント削除
- [x] Actionに引数を与えている部分だが、statusのkeyなので、data/statusをimportしてその値を入れるべき

## src/repository/
- [x] コメント削除
- [x] `error.ts`はmodel配下に移動したい
- [x] importJsonFileの帰り値はgenerics型, exportJsonFileの引数はunknownが来ているが、これらをstringに変更したい。serialize,deserializeはBattleRepository側で行いたい

## src/form/
- [x] コメント削除
- [x] action.tsのsideLabelで`FIRST`という定数を使っているが、modelの値をimportして利用したい
- [x] action.unit.test.tsにreceiverSelectOptionのテストがない
- [x] creation.tsは定数がstringになっているが、modelの値をimportして利用したい
- [-] creation.tsでformの定義だが、normal/warでそもそも型定義を別にしてunion typeとしたい。normalにはstepBaseとunitCountがない。これは可能ならするが、必要以上にややこしいならしない。

## src/controller/
- [x] コメント削除
- [x] act.tsでvalidateReceiversを呼び出しているが、これはdoActの内部で呼ばれるべき。actはもう少し短くなるはず
- [x] act.tsの頭で、UserCancelのダイアログを出すべき。コード量が減る
- [x] act.unit.test.tsに`doActionForm.actionKey === ORDER_DO_NOTHING`のパターンがない。その場合に、保存できる場合、cancelする場合がある
- [x] start.tsはcreate.tsと、format.tsに分ける。関数名もそれに準じた形に
- [x] start.tsから移動したregisterBattleはcreateBattleになる。引数はcreationFormとversionの2つにする。通常モードの場合は、unit登録まで行う。unit登録は、formatBattleで呼び出すformatではなく、別の関数でunitsの引数がいらないものを用意して呼び出す形
- [x] start.tsから移動したstartBattleはformatBattleになる。battleが編成中でない場合はエラーとする。また、呼び出しているcopyBattle,start関数は一つのまとまりとして、format関数としてmodelに定義する。
- [x] surrender.tsはcopyBattle,surrender,決着の記録はmodelがわの一つの関数にまとまっているべき
- [x] surrender.tsのactionDateはrepositoryから取得できるので、引数には受け付けない

## src/guide/
- [x] コメント削除

## src/pages/
- [x] コメント削除
- [x] `guide/*`配下にindex.tsxを配置し、そこでpathを引数として渡す形を取る。stringが""ならばguideとすればいい。
- [x] guide/app.tsxのguideEntries,GuideIndexはfeatureに移動する
- [x] guide/app.tsxのNotFoundはcomponent/utility.tsxに移動して共通化
- [-] guide/piece/app.tsxはもしかしたら戦闘中画面と共通化できるかもだが、要検討
- [x] list/app.tsxで対戦中/編成中の判定ロジックはmodel側に持ちたい
- [x] list/app.tsxのonDeleteはcontrollerに移動
- [x] list/app.tsxのBattleSummary型は不要。battleがkeyを持っているし、不要なはず
- [x] list/app.tsxのuseLiveQueryにわたすcallbackもcontrollerに移動する
- [x] v1/app.tsxにも編成中の判定ロジックがあるので、modelに
- [x] v1/app.tsxでlocal変数を使っているが、Contextに存在するので、Contextのコンポーネント内部に移動して、そこのlocalを使う

## src/feature/
- [x] コメント削除
- [x] creation.tsxでformのdefault値は、form/creationに持たせるべき
- [x] creation.tsxでmodeをuseStateしているが、modeの値は入力されたものなので、form側の値を読み込むことでuseStateは不要にならないか。要検討。
- [x] creation.tsxのcreate関数は、controllerのstart.tsの修正をすることで、controllerとtransitを呼ぶだけになっているはず。
- [x] formation.tsxでselectedPieceのためにuseStateを使っているが、この値はformから取ることでuseStateを消せないか
- [x] formation.tsxで、unitsをstate管理しているが、引数のbattleがuseLiveQueryで管理されているので、battleに一つ一つunitsを追加していけばそちらでstateを管理してくれそう。画面としては、単に編成中にunitを一つ一つ選ぶだけの画面になる。ただ、これは要検討。
- [x] formation.tsxでaddUnitはcontrollerに移動したい。
- [x] formation.tsxの選択済みunits一覧は、パーツとして切り出して、componentsに移動する
- [x] action.tsxのpieceName, statusName, GameStatus, ActionOrderEntryはcomponentsに移動する
- [x] action.tsxのaddReceiverの中のreceiverの値の計算は、form側に関数を切って任せたい

## src/components/
- [x] コメント削除
- [x] markdown.tsxのMarkdownPageはfeatureに移動
- [x] piece_image_src.tsxの内容は、piece_image.tsxに含めてしまいたい
- [x] guide_diagram.tsxのCostPaperDiagramは、独立したファイルに切り出したい。ファイル名もcost_paper_diagram.tsxで
- [x] 文字列だけを出力するものは、label.tsに集めておきたい

## src/model/
- [x] src/feature/action.tsxのlastTurn,reload関数は不要な気がする。もともと最新turnを表示するか、現在ターンのままかをコントロールするためのものだったが、action実行したら、最新ターン表示になっているので、turnをstate管理する意味がない。
- [x] action.ts
  - [x] コメント削除
  - [x] ReceiverDuplicationErrorはerror.tsに移動
- [x] battle.ts
  - [x] コメント削除
  - [x] getFormationUnitsはturnに移動し、また判定としてOrderがformationのものを抽出。
  - [x] sortedUnits, nextActorは、feature/action.tsxの修正ができたらturnに移動する。またbattleからそれらを呼び出す関数(引数battle)を用意し、feature/action.tsxからはそちらを呼び出す。
  - [x] start関数はturn.tsに移動
  - [x] formatNormal,format,addFormationUnitのテストがない
- [x] error.ts
  - [x] コメント削除
- [x] piece.ts
  - [x] コメント削除
- [x] resolver.ts
  - [x] コメント削除
- [x] simulation.ts
  - [x] コメント削除
  - [x] 内容はbattle.tsに移動する
- [x] status.ts
  - [x] コメント削除
- [x] turn.ts
  - [x] コメント削除
  - [x] 関数にはテストを記述する
  - [x] applyActorCostでcopyUnit使ってない
  - [x] applyActorCost,clearActorStatusesは、unit.tsに移動
- [x] unit.ts
  - [x] コメント削除

### 調査: model配下(battle.ts除く)で定義した関数の、model外からの利用経路

model改善の前提調査。各ファイルで定義した関数(値)について、model外モジュールから呼ばれている経路を関数ごとにまとめた。
※`import type` のみ(型としての利用)は対象外。`piece.ts` / `resolver.ts` / `status.ts` は型・型エイリアスのみで関数定義なし。

#### unit.ts
| 関数 | model外の呼び出し元 | 用途/経路 |
|---|---|---|
| `toUnitReference` | feature/action.tsx | 選択unitからUnitReference生成(受信者・行動主参照) |
| `nextFormationSide` | feature/formation.tsx | 次に駒を置くsideの決定 |
| `sideHasLeader` | feature/formation.tsx | (model/battle.addFormationUnit内でも利用) リーダー重複判定 |
| `canAddPiece` | feature/formation.tsx | (同上) 駒追加可否 |
| `isFormationComplete` | feature/formation.tsx | (同上) 編成完了/リーダー未設定エラー判定 |
| `FIRST`(定数) | form/action.ts | side既定値 |
- model内(battle.ts)専用で外部利用なし: `copyUnit` / `sameUnit` / `buildNormalUnits`

#### turn.ts
| 関数 | model外の呼び出し元 | 用途/経路 |
|---|---|---|
| `ORDER_DO_NOTHING`(定数) | controller/act.ts, form/action.ts (test: controller/act.unit.test.ts) | 「何もしない」選択肢の識別子 |
- model内(battle.ts)専用で外部利用なし: `copyOrder` / `copyTurn` / `clearActorStatuses` / `applyActorCost`

#### action.ts
| 関数 | model外の呼び出し元 | 用途/経路 |
|---|---|---|
| `buildAction` | data/action/*.ts (全Action定義) | Actionオブジェクト組み立て |
| `effectBaseDamage` | data/action/ 攻撃系(meleeAttack, rangedAttack, rangedSpread, chargeMelee, kingsBlow, puppet, pushAttack, strongSpear, meleeSpread, barricade, piercingArrow, spearAttack, heavyMelee, strongRanged) | act生成 |
| `effectGrantStatus` | data/action/{arrowDodgeStance, interceptionStance} | act生成(status付与) |
| `effectHeal` | data/action/healing | act生成(回復) |
| `effectOverHeal` | data/action/substitute | act生成(過剰回復) |
| `filterActor` | data/action/{arrowDodgeStance, barricade, interceptionStance} | filter生成(自身のみ) |
| `filterAlive` | data/action/ 攻撃・回復系の大半 | filter生成(生存unit) |
| `ReceiverDuplicationError`(class) | controller/act.ts, feature/action.tsx | 受信者重複エラーのnew/判定 |
- 経路補足: `buildAction`/`effect*`/`filter*` はdata/action層でActionを構築→repository→resolver経由でmodel/battle(`doAct`)・model/simulation(`simulate`)が実行、という循環。
- model内(battle.ts)専用で外部利用なし: `validateReceivers`

#### simulation.ts
| 関数 | model外の呼び出し元 | 用途/経路 |
|---|---|---|
| `simulate` | feature/action.tsx | 行動プレビュー(受信者の生死シミュレート) |

#### error.ts (classをnewで生成)
| class | model外の生成元 | 用途/経路 |
|---|---|---|
| `JsonSchemaUnmatchError` | repository/battle.ts, repository/utility.ts, controller/list.ts, pages/v1/app.tsx | スキーマ不一致の生成/判定 |
| `DataNotFoundError` | controller/act.ts, feature/action.tsx | (battle.ts内部でも生成) データ未存在 |
| `UserCancel` | controller/act.ts, controller/surrender.ts, feature/action.tsx | 確認ダイアログのキャンセル |
| `CopyFailError` | repository/battle.ts, repository/utility.ts | コピー失敗 |
- 外部含め利用箇所なし(未使用の可能性): `DataExistError` / `EmptyParameter`

## その他
- faviconの用意。将棋の駒だが、中は漢字ではなく十字になっているというものにするか。これなら簡単だ
- docsディレクトリ以下のファイルの削除はこのPRが終わったら。.gitkeepだけ残す

