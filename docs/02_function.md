
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

### 4. actionのact関数、filter関数の共通化
- ちゃんとロジック精査する
- **前提: アプリはターン管理＋HP/status管理に限定する（盤は実物/紙）**。actが計算するのは**HP・statusの変化のみ**（ダメージ/回復/status付与。例: 回復処方=最大回復、迎撃体制=被ダメ-1 status、操り人形/身代わり=HP・status操作）。
- **座標依存のロジック（到達距離/影響距離/範囲/貫通/押出/防柵設置/盤上配置）は実装せず説明テキスト扱い（no-op）**。`reachLength`/`effectLength`等は表示用メタ情報。
- filterは盤位置で判定せず、**全unitリストからの絞り込み**を返し、最終的な対象はユーザーが手動選択する。

### 5. battle開始時のstepBase,unitCount,player_nameの入力。default値としてのversion指定
- モーダル画面で出して、battle登録したら、そのbattleの画面に
- titleの項目削除
- keyはuuidを設定
- **uuid・日時はrepository経由で供給する（provider化）**。controllerがrepositoryからuuid/日時を取得してbattleを生成する（01_copy.md L205）。
- **version は v1 では「保存文字列＋URLガードのみ」と割り切る**。versionごとのルール分岐ロジックは持たず、battleが自分のversion文字列を保持し、URL(step10/11)で表示可否をガードするだけにする。
- このstep完了時点ではhome/visitorは残置（units化はstep6以降）。store_schema/battle・store/battle（key: title→uuid）・procedure/start・subpage/componentsのURL/参照をこのstep内で揃えてgreenに戻す。

### 6. battleでのparty追加ロジック
- battleでpartyを追加して開始できるようにする
- battleで追加する際に、party battlingを追加できるようにする
- party_battlingではなく、battle.unitsに登録するようにする
- home,visitorの削除
- **境界の注意**: `home/visitorの削除`と、それらを参照している箇所の`battle.units`への切替は、step完了時にgreenを満たすため**このstep内で完結させる**（参照切替をstep8に残さない）。store key参照への寄せ（controller/presentationでのstore参照・利用ロジック）はstep8で行う。なおaction/skill解決は、step7の時間モデル移行が先に来るため、このstepでは完全なkey参照を求めず過渡的な形でよい。

### 7. steps/stepBase 時間モデルへの移行
（01_copy.md「11. 時間経過ロジックの変更」を引き継ぐ独立step。units構築(step6)で入る`steps`を直後に確定させ、参照配線(step8)が安定した順序エンジン/Turn契約に対して行えるよう、参照・利用切替より先に行う）
- WT/restWtによる仮想時間を廃し、**行動ポイント方式**へ。各駒は`steps`（初期0）を持ち、`steps`最小の駒が次に行動。同点は`Turn.units`のindex（初期順）で決着。
- 行動後: 死亡駒を除外し、行動駒の`steps += stepBase + cost`（cost: 何もしない0 / 通常行動2 / 反動行動7）。`stepBase`は開始時駒数で**定数固定**。
- `Order`の`TimePassing`を廃止。`actor`は`Turn`が持つ。kniwの二重Turn/sleepループ/時間経過処理を廃し、`spendTurn`を「行動適用→死亡除外→steps更新→並べ替え→勝敗判定」に簡素化。
- `datetime`はTurnの履歴用に残す。
- この時点ではaction/skillの解決はstep6から引き継いだ過渡的な形のままでよく、順序エンジンをsteps化してgreenに戻す。key参照への寄せはstep8で行う。

### 8. characters->units移行
- controller,presentationでのpiece,status,action store呼び出し
- ダメージ計算は主にActionのact関数に閉じているので、Action keyを受け付けて呼び出せるように切り替える
- step7で確定したsteps順序エンジンとTurn/act契約に対して、参照解決をkeyベースへ配線する。

### 9. 戦乱モードではなく、通常モードでplayer_nameだけ入力できるformを用意し、default値のunitsを適用

### 10. battle画面のurlをversion番号に
- 同一versionじゃないと表示できなく

### 11. 一覧画面のurlをlistに
- battleが指定されたら、versionをみて、当該のversion画面に遷移

### 12. modelの型はzodから導出できるように
- 保存するデータ型が一致していない状態を解消する必要があるので、battleからのskill参照やpiece参照をkey参照にして、presentationやcontrollerで解決する
- **store_schema→model統合（step14の該当項目）と密接に連動する**。可能なら隣接させて進める。
- **着手前にmodel→store(repository)→modelの循環依存を調査する**（01_copy.md step10 NOTE）。schemaをmodelに取り込む際に循環が残らないか確認してから進め方を決める。

### 13. repositoryの初期化はすべて一緒に行う
- 初期化が必要なのはbattle tableぐらいで毎回使うので

### 14. ディレクトリ統廃合
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

### 15. 駒画像導入

### 16. UI調整
たぶんもっといろいろ治すところが出てくる

### 17. dependabot導入
- 他stepへの依存が無いため、サプライチェーン対策の観点で**前倒し実施も可**。

### 18. github actions見直し
- npm workspace使わなくなったので、それに伴って開発コマンドの見直し
- アプリケーション名の見直し
- step17同様、他stepへの依存が無いため**前倒し実施も可**。

### 19. プレイヤー向けの説明ドキュメント整備
markdownで書いてHTMLに変換したいが、reactで直書きのほうがいいかも
markdownから変換するツールはいろいろありそうだが、装飾が面倒かもしれない
githubを見るのではなく、画面上でみれたほうが良さそうだが、どこに置くかは要検討

