
## 機能定義

### 機能
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

### UI/UX
画像として将棋のコマを入れるのは必要
partyを作るモードとデフォルトのpartyモードの追加

## 実作業

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
