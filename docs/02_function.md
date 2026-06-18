
# plan

## 機能
- 型定義の変化
  - types.mdに記載している形にする。これに伴って様々な機能変化があるので、これはタスクではなくゴール。
- battleのkeyはuuidにする
  - 画面上の表示はfirst player name, second player name, 日付時刻, battleの状態
  - uuidは画面上に表示されないkey
  - battleにtitleのような任意の名前はつけられない
- 時間経過ロジックの変更
  - 最初にorderが決まっている状態
  - 基礎コスト+Actionごとのコストが加算される
  - コストが小さいunitから動くが、コスト同値ならorderが小さい方から
  - ActionコストはActionごとに決まっていて、基礎コストは基本的に全体のunit数だが、最初に設定可能
- battleにはversionがあり、そのversionのルールで実行する
  - そのversionのbattleは途中で変更できない
  - battle自身がどのversionか知っている
  - 画面のurl上もversionが切られる
  - 特定のbattleは、そのversionの画面でしか表示できない
- HPは基本Max3となり、ダメージ幅も基本1とか2とかで、技ごとのダメージ量の固定値となる。
- 技の属性は存在するが、基本的に説明のためのもの
  - 到達距離
  - 影響距離
  - ダメージ量
- 技の影響については、関数をもってunitを受け付けて、関数内で値を変化させる形
- また技を与えられるunitの選択肢についても、全体のunitリストから絞り込む。その関数も持っている。
- battleには先手、後手があるが、その名前についてのみ登録する。このプレイヤーが先手、ではなく先手の名前がどう。という登録のやり方
- battleには、通常モードと戦乱モードがあるが、UI上の挙動の違いだけで、battleのデータ型は同一
  - 戦乱モードはすべてを選択できるが、通常モードは時間経過ロジックの基礎コストと、unitリストと順序が完全固定される
  - 戦乱モードでは、時間経過ロジックの基礎コストのようなメタパラメータを選択できる
  - 戦乱モードでは、先手、後手で交互にunitを選んでいき、事前にきめた規定数まで選んだら完了して、戦闘に進める
  - partyの事前登録という概念はなくなる
- partyという概念がなく、先手/後手に属するunitであることがわかればいいので、フラットにunitを管理しつつ、unit自身が先手/後手であることを知っている構造
- 画像として将棋のコマを入れるのは必要
- partyを作るモードとデフォルトのpartyモードの追加

## 作業感

### モデリングとロジック
- model命名変更
  - charactor -> piece
  - charactor battling -> unit
- partyの削除
- 通常モードでのデフォルトunit list定義
- pieceの定義
  - pieceがactionを持つ構図
  - action listはpieceの定義から導出可能にする
  - pieceは固定された設定なのでMaxHPやpieceの属性などはすべて保持している状態
  - turn管理ロジックのため、今までかけてきたコストを保持する
- pieceを指定してunitが成り立つ感じ
  - unitは他にも値を持つが、変動する。hpとか
  - sideで先手/後手どちらに属しているか分かる
- statusの定義
  - だいぶ減って有利ステータスのみ残る
- controllerでの参照
  - unit, action, statusは、battleはkeyしか持たないので、controllerやpresentationで参照する
- battleでunit選択画面は、規定数までunitを選ぶまでunit選択中の表示で、終わったら戦闘中
  - battle中はturnが増えていくイメージ
- actionのコストは、軽いものが2、重いものが7
- 旧Action,現OrderのTimePassingはなくなる。
  - 代わりに最初のturnのorderはformation(編成)ができる

### 開発の下回り
- dependabot導入
- github actions見直し
  - npm workspace使わなくなったので、それに伴って開発コマンドの見直し
  - アプリケーション名の見直し
- ディレクトリ統廃合
  - model -> 何もしない
  - store -> repositoryに命名変更
  - store_data -> dataに命名変更
  - store_schema -> modelに統合。更にmodelの型情報をzodから導出できるように修正する
  - store_utility -> ファイルをrepositoryに移動
  - components -> 何もしない
  - form -> 何もしない
  - io -> 中身はrepositoryに移動して削除
  - pages -> 何もしない
  - procedure -> controllerに命名変更
  - subpage -> featureに命名変更
- modelの型はzodから導出できるように
  - 保存するデータ型が一致していない状態を解消する必要があるので、battleからのskill参照やpiece参照をkey参照にして、presentationやcontrollerで解決する
- repositoryの初期化はすべて一緒に行う
  - 初期化が必要なのはbattle tableぐらいで毎回使うので

## 作業計画

### 進め方の方針（全step共通）
- **各stepの完了時には必ずbuild/testがgreenであること**を満たす。step内（特にcutoverを含む5/6/7）は一時的にbuild redでもよいが、stepを跨いでredのままにしない。
- **モデルを変更したstepでは、対応するテストも同じstep内で改修する**（テスト改修を後回しにしない）。直前にコロケーションした`*.unit.test.ts`は旧モデルに密結合しているため、cutover系stepでは併せて直す。
- コア型の差し替え（Charactor/Skill/Party → Unit/Action、Battle/Turn再構築）は、battle基礎項目(step5) → units構築(step6) → units参照・利用(step7)の順で、各step完了時にgreenへ戻す。

### 1. rename
- Order: `turn.ts`のAction（判別union: DoSkill/DoNothing/TimePassing/Surrender）を`Order`にrename。
- 名前衝突に注意: types.mdでは旧skillが新`Action`になり、`battle.ts`にも旧`Action`(`{ skill, receivers }`)が存在する。union→`Order`へ寄せたうえで、旧`battle.ts`の`Action`は後続step(2,7)の新`Action`/`Order`へ吸収・整理する。

### 2. 新規項目、型定義
- Formation: 新規定義
- Status: label->key
- Action: 新規定義だが、skill参考に
- Piece: 新規定義だが、character,physical参考に
- Unit: 新規定義だが、character,physical,character_battling参考に
- UnitReference: 新規定義。unit.tsに
- Side: 新規定義。unit.tsに
- Turn: units追加。初期値はlength=0
- Battle: key,first_player_name,second_player_name,stepBase,unitCount,version追加。初期値は適当
- この段階では新型は「追加」のみ（旧型と共存）とし、buildをgreenに保つ。実際の差し替えはstep5以降。
- **このstepで新規定義したモジュールには、ロジックを持つものにテストを追加する**（コロケーションの`*.unit.test.ts`）。

### 3. piece,actionをそれぞれ定義
- data/action
- data/status
- data/piece
- store/action
- store/status
- store/piece
- **statusの継続時間の表現を設計する**。note.mdの反動行動/技能（迎撃体制=被ダメ-1、矢かわし=近接無効、足止め 等）は「次の自分の行動まで」有効な持続statusだが、types.mdの`Status`はduration項目を持たない。steps方式では「その駒の次の行動が来るまで」をどう保持/失効させるか（Unit側にstatus残数を持つ等）をstep4の前に確定する。`STATUS_DURATION=500`（WT前提の応急処置）はここで解消する。

puppetの実装を検討。遠隔と近接の区別がつかなくなるので、近接あつかいとして、遠隔でも必中としておく形にする
遠隔、近接の違いはactionのreach lengthで判断。それを含めて、statusをみてダメージ量の計算をするように変更する

### 4. actionのact関数、filter関数の共通化
- ちゃんとロジック精査する
- **前提: アプリはターン管理＋HP/status管理に限定する（盤は実物/紙）**。actが計算するのは**HP・statusの変化のみ**（ダメージ/回復/status付与。例: 回復処方=最大回復、迎撃体制=被ダメ-1 status、操り人形/身代わり=HP・status操作）。
- **座標依存のロジック（到達距離/影響距離/範囲/貫通/押出/防柵設置/盤上配置）は実装せず説明テキスト扱い（no-op）**。`reachLength`/`effectLength`等は表示用メタ情報。
- filterは盤位置で判定せず、**全unitリストからの絞り込み**を返し、最終的な対象はユーザーが手動選択する。

### 5. battle開始時のstepBase,unitCount,player_nameの入力。default値としてのversion指定
- new画面でbattle登録したら、battleの画面で表示する
- titleの項目削除
- keyはuuidを設定。uuidはv7を利用する
- **uuid・日時はrepository経由で供給する（provider化）**。controllerがrepositoryからuuid/日時を取得してbattleを生成する（01_copy.md L205）。
  - 具体的には、window_dialogueのDialogueに関数を追加して利用する。日付の関数も同時に追加
- **version は v1 では「保存文字列＋URLガードのみ」と割り切る**。versionごとのルール分岐ロジックは持たず、battleが自分のversion文字列を保持し、URL(step10/11)で表示可否をガードするだけにする。
- このstep完了時点ではhome/visitorは残置（units化はstep6以降）。store_schema/battle・store/battle（key: title→uuid）・procedure/start・subpage/componentsのURL/参照をこのstep内で揃えてgreenに戻す。

### 6. battleでのparty追加ロジック
- battleでpartyを追加して開始できるようにする
- battleで追加する際に、party battlingを追加できるようにする
- party_battlingではなく、battle.unitsに登録するようにする
- home,visitorの削除
- **境界の注意**: `home/visitorの削除`と、それらを参照している箇所の`battle.units`への切替は、step完了時にgreenを満たすため**このstep内で完結させる**（参照切替をstep8に残さない）。store key参照への寄せ（controller/presentationでのstore参照・利用ロジック）はstep8で行う。なおaction/skill解決は、step7の時間モデル移行が先に来るため、このstepでは完全なkey参照を求めず過渡的な形でよい。

#### 6の済み分（実装メモ）
- `Turn.units`をロスターのsource of truthに（types.md準拠。Battle.unitsは新設しない）。`store_schema/unit.ts`新規・`turnSchema.units`（`default([])`で旧データ互換）・`battleSchema`からhome/visitor削除。
- `model/battle.ts`: Battle型からhome/visitor削除、`createBattle(key, firstName, secondName, stepBase, unitCount, version)`は骨格(turns=[])生成、`start(units, datetime)`で先頭Turn.units構築。sortedCharactors/WTエンジンは**非稼働で残置**（units消費の順序エンジン化はstep7）。
- UI: `components/unit.tsx`(SelectUnits)新規、`new.tsx`はparty選択を廃しplayer名入力＋piece選択でunits構築。player名はparty名流用をやめ明示入力に。
- WTエンジン依存の`act/simulate/surrender`の単体テストは`describe.skip`（step7でunitsベースに書き直して復活）。

#### 6の残作業（ここから再開）
- **units選択をnew.tsxから「次の画面」へ移す**。battle登録直後の画面（編成段階）でunitsを選ぶUX。types.mdの`Battle.turns.length===0`＝編成段階の出し分けに対応させ、編成確定で先頭Turn（units入り）を1つ追加する流れにする。
- これに伴い**battleの型制約が変わる**: 現状`start()`が先頭Turn(units入り)を必ず作るが、再開後は「turns=[]（=units未選択・編成中）」を正規の状態として許容する。
- **`units=0ならbattleを進めない`制約も変わる**: new.tsxでの「駒1つ以上必須」バリデーションは編成画面側へ移し、登録時点ではunits=0（編成前）を許可する。編成画面でunits>0を確定したら戦闘に進める、という制約に組み替える。

### 7. steps/stepBase 時間モデルへの移行
（01_copy.md「11. 時間経過ロジックの変更」を引き継ぐ独立step。units構築(step6)で入る`steps`を直後に確定させ、参照配線(step8)が安定した順序エンジン/Turn契約に対して行えるよう、参照・利用切替より先に行う）
- WT/restWtによる仮想時間を廃し、**行動ポイント方式**へ。各駒は`steps`（初期0）を持ち、`steps`最小の駒が次に行動。同点は`Turn.units`のindex（初期順）で決着。
- 行動後: 死亡駒を除外し、行動駒の`steps += stepBase + cost`（cost: 何もしない0 / 通常行動2 / 反動行動7）。`stepBase`は開始時駒数で**定数固定**。
- `Order`の`TimePassing`を廃止。`actor`は`Turn`が持つ。kniwの二重Turn/sleepループ/時間経過処理を廃し、`spendTurn`を「行動適用→死亡除外→steps更新→並べ替え→勝敗判定」に簡素化。
- `datetime`はTurnの履歴用に残す。
- この時点ではaction/skillの解決はstep6から引き継いだ過渡的な形のままでよく、順序エンジンをsteps化してgreenに戻す。key参照への寄せはstep8で行う。

#### 7の済み分（実装メモ）
- `model/turn.ts`: `Order = Formation | DoAction(DO_SKILL: actionKey/actor/receivers=UnitReference) | DoNothing | Surrender`。`Turn`は`{datetime, order, units}`。`sortedCharactors`/`TimePassing`廃止。
- `model/battle.ts`: WT/restWtエンジンを全廃しsteps化。`sortedUnits`(steps昇順・同点はindex=安定ソート)、`nextActor`、`spendTurn`(actorの持続statusクリア→Act適用→steps+=stepBase+cost→死亡除外→並べ替え→勝敗判定)、`surrender`、`isSettlement`(side FIRST/SECOND)。`GameResult`を`HOME/VISITOR`→`FIRST/SECOND`に。
- `store_schema/turn.ts`: `orderSchema`(unitReference)・`units`へ。`store_schema/unit.ts`に`unitReferenceSchema`。`store_schema/battle.ts`はresult enum FIRST/SECOND、Charactor系エラー除去。
- `form/battle.ts`(DoActionForm: actionKey+receivers=`${side}:${piece}`)、`procedure/battle/act|simulate|surrender`をUnitReference/Action.actベースへ。`components/battle.tsx`はactor=units[0]・技=piece.actions・受け手=action.filter・行動順=sortedUnits表示に作り替え。act/simulate/surrenderの単体テストもunitsベースで復活。
- **Skill系・party画面を削除**: `model/skill`,`store/skill`,`store_data/skill/*`,`components/charactor`,`components/party`,`form/party`,`procedure/party`,`subpage/party`,`pages/party`、vite party入口、partyRepositoryをIO contextから除去。

#### 7の残（dead code削除済み）
- 旧Ogre-Battle系のデータ層を**物理削除済み**: `model/charactor` `model/party` `model/physical` `model/charactor_status`、`store/charactor` `store/party` `store/charactor_status`、`store_schema/charactor` `store_schema/party` `store_schema/status`、`store_data/status/*`(旧)、`form/charactor`(各testも)。
- 併せて生存コードの旧参照を切離: `subpage/battle/battle.tsx`の`CharactorDuplicationError`分岐除去、`io/indexed_database.ts`のpartyテーブル削除＋battleの主キーを`title`→`key`に修正。残るのはunits/Action/piece/status(新)系のみ。

### 8. characters->units移行
- controller,presentationでのpiece,status,action store呼び出し
- ダメージ計算は主にActionのact関数に閉じているので、Action keyを受け付けて呼び出せるように切り替える
- step7で確定したsteps順序エンジンとTurn/act契約に対して、参照解決をkeyベースへ配線する。

#### 追加仕様: leader(大将)
- `Unit`に`leader: boolean`を追加(`store_schema/unit`のzod schema・toUnit/toUnitJsonも対応)。
- 編成画面(`components/formation.tsx`)で各unit追加時に「大将にする」を選択可能。先手/後手それぞれ**ちょうど1体**leader必須で、揃わないとStart不可。
- `model/battle.ts`の`isSettlement`を**leader生存判定**に変更: leader(hp>=1)が居なくなった陣営は敗北。両陣営leader消失でDRAW。surrender判定は従来通り優先。
- 旧「片側全滅で敗北」ロジックは置換(各陣営にleaderが居る前提なので、leader死=敗北で包含)。

### 9. 戦乱モードではなく、通常モードでplayer_nameだけ入力できるformを用意し、default値のunitsを適用

#### 9の済み分（実装メモ）
- `new.tsx`に通常/戦乱のモード選択(MUI select)を追加。通常モードはplayer名のみ入力(stepBase/unitCount入力欄は非表示)、戦乱モードは従来通りstepBase/unitCountを入力して編成画面へ。
- 通常モードは`unitCount=7`/`stepBase=14`固定。`model/normal_mode.ts`に定数と`buildNormalUnits`を新設。
- `buildNormalUnits`: note.mdの初期順番(飛->角->金->銀->桂->香->王)で、駒順ごとに先手->後手で**交互**にUnitを並べる(steps=0同点はindex決着なので、この並びが第1ラウンドの行動順)。leaderは`king`固定。hpは各pieceのMaxHP。piecegetterはDIで受け取りmodel層をstoreから独立に保つ。
- 通常モードのbattle作成は`registerBattle`(14,7)→`buildNormalUnits`→`startBattle`を即時に連結し、編成画面を出さずそのまま先頭Turnまで積んで開始する。
- colocation unit test: `model/normal_mode.unit.test.ts`。

### 10. battle画面のurlをversion番号に
- 同一versionじゃないと表示できなく
- 加えて、/newというpathをつくって、新規battleはそっちに流して、battle登録したら/v1とかのurlへ遷移する形へ

### 11. 一覧画面のurlをlistに
- battleが指定されたら、versionをみて、当該のversion画面に遷移

#### 10/11の済み分（実装メモ・同時対応）
- vite multi-pageのエントリを再編。旧`battle`ページ(`?key`で new/list/battle を出し分け)を廃止し、`new`/`list`/`v1`の3エントリに分割(`vite.config.ts`の`rollupOptions.input`)。URLは`/new/` `/list/` `/v1/`。`/`(home)は据え置き。
- `src/pages/{new,list,v1}/`に`index.html`/`index.tsx`/`app.tsx`を新設。旧`src/pages/battle/`は削除。subpage(`subpage/battle/{new,list,battle}.tsx`)は移動せず参照のみ付け替え。
- repository初期化+IOProvider配線を`components/battle_io.tsx`(`BattleIO`)に共通化し、3ページのapp.tsxから利用。
- `/v1`は`?key=<uuid>`で対象battleを表示。`BattleExsiting`に`version`propを追加し、`battle.version`と不一致なら表示しない(step10「同一versionじゃないと表示できない」)。turns空なら編成画面(`BattleFormation`)、それ以外は戦闘画面。
- リンク/遷移の付け替え: home「バトルの管理」→`/list/`、list「新しく作る」→`/new/`・各battle→`/v1/?key=`、`new.tsx`の登録後transit→`/v1/?key=`、各画面のbackLink`/battle/`→`/list/`。`__new`分岐は廃止。

### 12. modelの型はzodから導出できるように
- 保存するデータ型が一致していない状態を解消する必要があるので、battleからのskill参照やpiece参照をkey参照にして、presentationやcontrollerで解決する
- **store_schema→model統合（step14の該当項目）と密接に連動する**。可能なら隣接させて進める。
- **着手前にmodel→store(repository)→modelの循環依存を調査する**（01_copy.md step10 NOTE）。schemaをmodelに取り込む際に循環が残らないか確認してから進め方を決める。

#### 12の済み分（実装メモ）
- 循環依存調査結果: `model`は`io/dialogue`(型)と自layerのみに依存し、store/repositoryへは非依存。よってmodelにzodを入れても循環は生じない(store_schema→model、store→model/store_schemaの一方向のまま)。
- key参照化はstep7/8で完了済みのため、シリアライズ対象型はdatetime(Date vs string)以外、modelとjsonの形が一致。これを前提にmodel型をzod導出へ変更。
- 対象(保存されるmodel型): `model/unit`(sideSchema/unitSchema/unitReferenceSchema→`Side`/`Unit`/`UnitReference`)、`model/turn`(formation/doAction/doNothing/surrender/orderSchema/turnSchema→`Order`/`Turn`等。datetimeは`z.date()`)、`model/battle`(gameResultSchema/battleSchema→`GameResult`/`Battle`)。型は全て`z.infer`で導出。関数(copy系/sortedUnits/spendTurn等)は変更なし。
- 対象外: `Piece`/`Action`/`Status`はメモリ常駐のデータ定義(キーのみ保存)で直列化しないため、従来通り手書き型のまま。
- store_schema(json schema+converter+repository検証schema)は**step12では据え置き**。modelとstore_schemaに同形schemaが一時的に二重化するが、これはstep14(store_schema→model統合)で解消する。store_schemaはmodelの型importのみで互換(変更不要)。

#### 12の追加対応: datetime型の一致（step14先行）
- 唯一の差分だった`turn.datetime`(model=Date / json=string)を**Dateに統一**。分岐を作らず統合できる状態にした。
- 仕組み: IndexedDB(Dexie)は構造化クローンで`Date`をネイティブ保存できるため、保存・取得は`Date`のまま。JSON import時のみ文字列が来るので、schemaを`z.coerce.date()`にして文字列→Dateへ自動変換。
- model/store_schema双方の`turnSchema.datetime`を`z.coerce.date()`に統一(infer型はともに`Date`、schema自体も同形に)。
- `toTurn`/`toTurnJson`/`toBattle`からdatetime変換(date-fnsの`parse`/`format`)を撤去。datetime正規化はschema(parseJson)に集約され、converterは構造写像のみ・エラーなし(`toTurn`/`toBattle`は`ToModel<...,never>`)。
- 後方互換: 既存の文字列datetimeで保存済みのデータも、読み込み時に`z.coerce.date()`がDate化するため問題なし。export時は`JSON.stringify(Date)`によりUTC ISO文字列になる(時刻は保持)。

### 13. ディレクトリ統廃合
- model -> 何もしない
- store -> repositoryに命名変更
- store_data -> dataに命名変更
- store_schema -> modelに統合。更にmodelの型情報をzodから導出できるように修正する
- store_utility -> ファイルをrepositoryに移動
- components -> 何もしない
- form -> 何もしない
- io -> 中身はrepositoryに移動して削除
- pages -> 何もしない
- procedure -> controllerに命名変更
- subpage -> featureに命名変更

そもそも役割が曖昧で、特にmodelに実装すべき部分がformにあったりするので、どこに書くべきか考えて移す作業も必要

#### 進め方（サブステップ分割。各完了時にbuild/test green）
- **13-1: store_schema -> model統合**（済み。下記）
- **13-2: store_utility・ioをstoreにmerge**（store_utility/ioの中身をstoreへ移動し、空になった元dirを削除）
- **13-3: 命名変更**（store->repository / store_data->data(済) / procedure->controller / subpage->feature。importを一斉付け替え）
- 「役割が曖昧でmodelに実装すべき部分がformにある」等の**責務の移動は今回スコープ外**（別途コード精査して指示する。step15側で扱う想定）

#### 13-1の済み分（store_schema -> model統合）
- **converter(`toModel`/`toJson`)を全廃**。datetime統一(step12先行)で保存型とmodel型が完全一致したため、変換は不要に。**model型(=zod schema)をそのまま保存・取得**する。
- `store_utility/schema.ts`から`ToModel`/`ToJson`型を削除。`store_schema/`(unit/turn/battle + 各Json型エイリアス + converter)を**ディレクトリごと削除**。重複していたzod schemaはmodel側を正とする。
- `disk_repository.ts`: `createRepository`から`toModel`/`toJson`引数を撤去。`save`/`exportJson`はmodelをそのまま渡し、`get`/`importJson`は`parseJson(schema)`の結果(=model)をそのまま返す。converterのエラー型`E`も不要になり`Repository<M>`へ簡素化(get/importJsonの戻りは`M | JsonSchemaUnmatchError | null`)。
- consumer付け替え: `store/battle.ts`(`battleSchema`をmodelからimport、`createRepositoryBase<typeof battleSchema, Battle>`)、`io/indexed_database.ts`(`Dexie.Table<Battle>`)。
- テスト: `store_schema/battle.unit.test.ts`(toBattle検証)を`model/battle.unit.test.ts`の`battleSchema.parse`テストへ移設(datetime文字列->Date coerce・2turn/DO_SKILL構造を検証)。`store/battle.unit.test.ts`は`toBattle`->`battleSchema.parse`へ。

#### 13-2の済み分（store_utility・ioをstoreにmerge）
- `io/`(database/dialogue/indexed_database/window_dialogue)と`store_utility/`(disk_repository/memory_repository/schema)の中身を**`store/`へ移動**し、空になった`io/`・`store_utility/`を削除。
- import付け替え: 移動ファイル間は相対(`../io/database`->`./database`等)、外部consumer(procedure/components/form/subpage/model/store各所)は`../io/*`/`../store_utility/*`->`../store/*`(または同階層`./`)へ。`mv`で移動しEditで付け替え(sed不使用)。
- **既知のlayering smell(責務移動stepで解消予定)**: `io/dialogue`を`store/dialogue`へ移したことで、`model/unit`の`SelectOption`型importが**model->store**の型依存になった(`getSelectOption`/`selectUnit`がUI型をmodelに持つのが根因)。type-only importなので循環の実害(runtime/lint/build)は無いが、責務上は`SelectOption`等のUI型をmodelから外す対応が必要。13-3(命名変更)後の責務精査(step15想定)で扱う。

#### 13-3の済み分（命名変更）
- ディレクトリrename: **`store/` -> `repository/`**、**`subpage/` -> `feature/`**(`battle/`サブdirは保持)、**`procedure/battle/` -> `controller/`**(指示によりbattleサブdirを廃しcontroller直下にフラット化)。`store_data -> data`は既済のため対象外。
- フラット化に伴い`controller/`配下8ファイルの内部相対importは深さ2->1(`../../model/` -> `../model/`、`../../store/` -> `../repository/`、`../../form/` -> `../form/`)。同階層rename(repository/feature)の移動ファイルは相対importの深さ変化なし(外部consumerのpath tokenのみ変更)。
- 外部consumer付け替え: `components/*`・`form/battle`・`model/unit`の`../store/*` -> `../repository/*`、`components/*`の`../procedure/battle/*` -> `../controller/*`、`pages/{list,new,v1}/app.tsx`の`../../subpage/battle/*` -> `../../feature/battle/*`。`mv`(dir rename)+Editで実施(sed不使用)。
- これで13(ディレクトリ統廃合)のmodel/store/io/store_utility/store_schema/procedure/subpageの再配置は完了(責務移動は別途)。

#### 13-3の追加対応: featureディレクトリ廃止（step15「featureは不要かも」を先行）
- 1つのpathをquery stringで出し分けていた旧構成は10/11で解消済みで、各pageが独立path(`/list/` `/new/` `/v1/`)を持つ。`pages/*/app.tsx`は`feature`コンポーネントを`BattleIO`で包むだけの薄いwrapperだった。
- `feature/battle/{list,new,battle}.tsx`の中身を対応する`pages/{list,new,v1}/app.tsx`へ取り込み、**`feature/`を削除**。
- `useIO()`はIOProvider(`BattleIO`)の内側で呼ぶ必要があるため、旧featureコンポーネントは**app.tsx内のローカルコンポーネント**(`BattleList`/`BattleNew`/`BattleExsiting`、非export)として残し、`export const App`が`<BattleIO>`で包む構造にした。`pages/*`と`feature/battle/*`は同じ深さ2だったため相対importはそのまま流用。
- `v1/app.tsx`は`VERSION`定数とkey取り出し/early-returnを`App`に保持し、`BattleExsiting`をローカル化。

### 14. repositoryの初期化はすべて一緒に行う
- 初期化が必要なのはbattle tableぐらいで毎回使うので
- context.IOに入れる値を、そもそもrepositoryで作ってしまう感じ。そしたら簡単なので。あるいはbattleRepositoryだけ別にして、ほかは全部でもいい

#### 目的（2点）
1. **過剰な抽象化の解消**: repository配下に色々なinterface/genericが入り込んで変に抽象化されている状態をほどく。
2. **repository一括化 + context参照**: repository全体を1つのオブジェクトに固め、react contextでどこからも参照できるようにする。

#### 14-1の済み分（disk_repositoryのde-abstraction）
- `disk_repository`(generic `createRepository<S, M>`)は`repository/battle`からしか使われていなかったため、**generic抽象を廃止**。型引数を畳んで`repository/battle.ts`にBattle専用として素直に実装し、**`disk_repository.ts`を削除**。
- `BattleRepository`型は同形(save/list/get/remove/importJson/exportJson)を維持したため、consumer(context/battle_io/controller)・テストmockは無変更。`NAMESPACE`はbattle.ts内のlocal constへ、`SCHEMA_KEY`は`battle.key`直参照に置換。
- `memory_repository`(action/piece/statusの3箇所で利用)は本当に再利用されているためgenericのまま据え置き。

#### 14-2の済み分（indexed_databaseのbattle統合・Database抽象廃止）
- BattleRepositoryはschema変換が無く(zod型チェックのみ)battle固有ロジックも無いため、`Database`抽象(差し替え/mock用interface)が過剰。**`indexed_database`のDexie実装を`repository/battle.ts`へ直接インライン**し、`createRepository`内で`new KniwDB()`してテーブル操作・file pickerを直に実装。namespace抽象も廃止(battleテーブルのみ)。
- **削除**: `repository/database.ts`(Database型/Save・Get等のIO型/KeyValue)、`repository/indexed_database.ts`。`CopyFailError`はexportJsonの戻り型として残すため`repository/battle.ts`へ移設。
- **BattleRepositoryの単体テスト(`repository/battle.unit.test.ts`)を削除**: Database mockを差し込んで検証していたが、変換ロジックが消えDexie直結になったため、test対象は実質Dexie/zodのみで自前テストの価値がない(110->106テスト)。
- `createRepository`は引数なし(`() => Promise<BattleRepository>`)に変更。`battle_io.tsx`は`createDatabase()`を廃し`createBattleRepository()`を直接呼ぶ。`BattleRepository`の6メソッド形は不変なのでcontroller/contextやcontrollerテストのmockは無変更。

#### 14-3の済み分（repository内のファイル整理）
- DexieのDB class名を`KniwDB` -> **`BattleDB`** にrename(DexieのDB名`super("KniwDB")`は既存IndexedDBデータ互換のため据え置き)。
- `BattleDB`以外のclass構文はすべてエラー表現なので **`repository/error.ts`** に集約: `JsonSchemaUnmatchError`/`DataNotFoundError`/`DataExistError`(旧schema.ts)、`CopyFailError`(旧battle.ts)、`UserCancel`/`EmptyParameter`(旧window_dialogue.ts)。
- 残った非class内容を **`repository/utility.ts`** に集約: `parseJson`(旧schema.ts)、`createMemoryRepository`/`MemoryRepository`(旧memory_repository.ts)、`SelectOption`(旧dialogue.ts)。`schema.ts`/`memory_repository.ts`/`dialogue.ts`は削除。
- `window_dialogue.ts`はエラー2classを除いた残り(Confirm/Notice/GetUuid/Now/Dialogue/dialogue)を保持。
- importer付け替え: error symbol -> `repository/error`、SelectOption/createMemoryRepository -> `repository/utility`。`window_dialogue`は`Dialogue`型が残るためUserCancel行のみ個別に変更。
- repository構成(現在): `action / battle / error / piece / status / utility / window_dialogue`。

#### 14-4の済み分（window_dialogue -> local rename）
- `window_dialogue.ts` -> **`local.ts`** にrename。中の`Dialogue`型 -> **`Local`**、`dialogue`変数 -> **`local`** に変更(confirm/notice/getUuid/nowを束ねるローカル環境providerの意味)。
- `local`の衝突確認: ブラウザglobalに`local`は無く(`localStorage`はあるが`local`単体は無し)、ESMのmoduleトップレベル宣言はglobalThisに漏れない(仮に同名globalがあってもmodule内でshadowするのみ)。型`Local`は実行時に消えるため無関係。よって安全。
- importer付け替え: 型`Dialogue` -> `Local`(context/controller各所のparam型注釈)、パス`window_dialogue` -> `local`。const`local`は`battle_io`のみ利用で、IO contextのproperty名`dialogue`は据え置き(`{ ...repositories, dialogue: local }`)。controllerのparam名や`useIO()`のdestructure名`dialogue`も据え置き(型のみLocalに変更)。
- repository構成(現在): `action / battle / error / local / piece / status / utility`。

#### 14-5の済み分（目的②: repositoryを1オブジェクトに束ねてcontext参照）
- **`repository/index.ts`** を新設。`type Repository = { battle, piece, action, status, local }`(piece/action/statusは`typeof xxxRepository`で型導出)と、それを生成する`createRepository(): Promise<Repository>`(battleのみDexie初期化のため非同期)を定義。
- `components/context.tsx`: context値を`IO`型から**`Repository`型**へ。`useIO(): Repository`。`battle_io.tsx`は`createRepository()`を呼んで束ねたオブジェクトをそのままcontextに載せる(個別のbattle/local配線を廃止)。
- **memory repository(piece/action/status)の直接importを全廃**し、利用箇所をcontext/DI経由に統一(ユーザ選択: 完全DI化):
  - React component(`battle.tsx`/`formation.tsx`/`pages/{new,list,v1}`)は`useIO()`から取得。`battle: Battle` propとの名前衝突を避けるため`const { battle: battleRepository, local, piece } = useIO()`のようにalias。
  - 非Reactの`form/battle.ts`(`receiverSelectOption`/`toAction`)はrepositoryを引数で受け取るcurry形に変更(`receiverSelectOption(piece)(reference)`、`toAction(action)(form)`)。型は`Repository["piece"]`/`Repository["action"]`。
  - `battle.tsx`のmodule-level helper`pieceName`/`statusName`も引数でrepositoryを受け取る形に。`UnitStatus`/`ReceiverSelect`はcomponentなので`useIO()`で取得して渡す。
  - `toAction`を呼ぶ`controller/act`に`action: Repository["action"]`引数を追加(`act(local, battleRepository, action)`)。memory repoを使わない`surrender`/`start` controllerは無変更。act単体テストは実`actionRepository`をimportして渡す。
- contextのproperty名が`local`になったため、component側の`dialogue`参照は`local`に統一。**controllerのparam名・テストのlocal変数も`dialogue`->`local`にrename**し、`dialogue`識別子を全廃(`utility.ts`の「旧dialogue.ts」コメントのみ旧ファイル名の史実として残置)。
- repository構成(現在): `action / battle / error / index / local / piece / status / utility`。

### 15. 内部構造の精査
精査してからタスクが出てくる
featureは不要かも。pagesを丁寧に定義したので。その代わりcomponent側に移すコードもあるはず。
あとはunitに駒が重複しないようにバリデーションが入りそう。その他、制約はmodelに実装したいが、けっこう外側で定義しちゃってる

#### memo
- BattleRepository#pickerOptsを含め、import/exportのロジック詳細は、utilityに寄せて呼び出したい
- form/battle.tsはaction.tsのほうがいい。んで、unit編成はformation.ts。battle作成でbattleかな
- formのToActionはDoActionInputがmodelに実装されてるのがいまいちね。modelの入力はmodelにして、ToActionの戻り値もmodelの値をいくつかにしておく。というか、formから、それらをそれぞれ取得できたほうがいいかも。
  actionなんかはrepo経由なので、これはformの責務外で、spendTurnにrepository#getを渡すならspendTurnでやればいい
  なので単にunitReferenceのlistを取得する関数を用意すればいい
  selectUnit関数もformに移してくるほうがいいね
  ReceiverDuplicationErrorだが、これはmodel側に実装すべき制約かな。1つずつ追加か、一気に追加は今後の検討課題。画面の実装方針がまだなので。一旦いまの一気追加で
- selectのoption取得はformに寄せたい。値の解釈もformの役割なので、そこに集まってるほうがいい。
- controllerは最初の引数で、Repositoryを丸々受け取りたい。
- modelに以下の型定義ほしいね。んで、各repositoryのgetを渡す感じ
  - (key:string) => Action | null
  - (key:string) => Piece | null
  - (key:string) => Status | null
  - これらがあると、model側にmemory repositoryを渡すことができる。これらはいずれにしろ必要になるはずなので
    action#actがpieceを要求する部分もこれで解決したい
- model/normal_mode.tsの内容はunit.tsに実装すべきね
  NORMAL_UNIT_COUNT,NORMAL_STEP_BASEはbattle
- turnにprevious:numberを追加したい。今後巻き戻しの機能実装のため
- battleのturnはsortする必要ないのと、hp:0でも残しておく。そのうえで、行動順や次のactorは算出する感じにする
- battle#spendTurnで借りのturnをつくって、cost計算してってやってるので、これはturn側のロジックにしたい。
  これらのロジックは丸々actionには移せないか。turnを知ってるのはよくないので。actionは、unitを受け付けてそのunitの計算をする感じにするか
  actorのcost消費はturnのしごとか。なのでこのあたりはturnに追加したいな
- component/utilityのroutingのはrepository/localに移動かな
- repository/indexでmemory3つのgetだけ集めたdictionaryを取得できるように。んで、これをbattle Modelにわたすので、形定義はModel側
- 細かい命名調整
  - skill->action
  - repositoryとmodelを区別したい文脈で接尾語にrepositoryをつける
  - その他
- UI調整あとの話だが、pagesのapp.tsxの細かい実装はcomponentに入れてもいいかも。ただ、これはもっとUI調整をしてから

### 16. dependabot導入
- 他stepへの依存が無いため、サプライチェーン対策の観点で**前倒し実施も可**。

### 17. github actions見直し
- npm workspace使わなくなったので、それに伴って開発コマンドの見直し
- アプリケーション名の見直し
- step17同様、他stepへの依存が無いため**前倒し実施も可**。

### 18. UI調整
たぶんもっといろいろ治すところが出てくる
駒画像導入も

### 19. プレイヤー向けの説明ドキュメント整備
markdownで書いてHTMLに変換したいが、reactで直書きのほうがいいかも
markdownから変換するツールはいろいろありそうだが、装飾が面倒かもしれない
githubを見るのではなく、画面上でみれたほうが良さそうだが、どこに置くかは要検討

