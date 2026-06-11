
とりあえず、書き出すところから
ゴールイメージとしての型と機能のイメージはあるが、具体的な機能の書き出しができてない
現状とのギャップをどのようにして埋めていくべきか、作業を分割して考えることができていない。これはデータ型とかから考えられるはず
まずは機能的な部分の書き出しか

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
  - 画面のurl上もversionが切られる
  - そのversionのbattleは途中で変更できない

## 実作業
- model命名変更
  - charactor -> piece
  - charactor battling -> unit

## others

battleのkeyはuuidにする。uuidも日付とかも、repository経由で取得できるようにする。battle repositoryはuuid生成を行わない。repositoryはシンプルになる。
時間経過ロジックがポイントベースになるのでだいぶ変化するはず
技について影響距離と到達距離の項目追加
visitor,homeをfirst,secondに変更する。またプレイヤー名を入力できるようにしてだれがfirst,secondか分かるように
party登録の際は、second->firstの順で交互にコマを登録していくので、その順序で
version管理したい。pathごとにversionを定義する感じ。一覧はversionなしで、battle自体がversionをもって、特定のpathに行くイメージ。なので一覧のpathは別にして、versionごとのpathを切る。そこでversionの変数を定義してアプリケーションにわたすイメージ
physical.tsの残りの項目はcharacter.tsに移動


## 8. party.tsの削除
partyの内容はbattleに統合するので、character[]をbattleに埋め込んだうえで、party.tsを削除する。  
partyを作る画面があるが、これはbattleのstepとしてpartyを作る段階を用意するので、battleの画面で出し分ける感じになる。  
partyを作る段階とは、battleのturn[]のlengthが0の状態で、partyを作り終えたのであれば、turnに1つ追加する。これを条件としてparty作成画面を出し分ける。

- `Battle.turns.length === 0` がparty作成段階（画面出し分け条件）。party確定で先頭Turnを1つ追加する。先頭Turnの `actor` は null 許容（行動前）。

## 9. skillの参照
skillはcharacterに埋め込まれた形で参照されるが、character上はkeyのみを持ち、controllerでskill実態を参照する。  
各ロジックには、選択したskillを渡す感じにしていく。  
character上のskillの埋め込みを削除したうえで、ロジックを成り立たせるように修正する。

### 駒種とskillの対応（F/Gと連動）
- 駒は `Charactor.piece`（駒種キー: 王将/金将/…）のみを持つ（型定義は `types.md` 参照）。
- data層で駒種 -> { 通常行動skill, 反動行動skill, 技能skill, 体力, 移動, 画像 } を定義する（note.mdの駒一覧が元データ）。
- 行動時は `Action.DoSkill.skillKey` で使った技を記録し、controllerがdata層からskill実体を解決してロジックに渡す。
- これにより `Charactor` からskill実体の埋め込みが消え、pieceベースの参照に一本化される。

> 補足: 「通常行動/反動行動」はstep11のcost(2/7)と対応。駒種(piece)ごとの固定技なので、kniwのacquirement(装備でskillが変わる仕組み)とは異なり、駒種で一意に決まる。
> なお、同一プレイヤー(side)内に同じ駒種は複数持てないルールなので、`CharactorReference`＝`{ side, piece }` で駒を一意に特定できる。

## 11. 時間経過ロジックの変更
kniwでは時間経過を仮想的な時間（WT/restWt）で表現していた。これを**行動ポイント方式**に置き換える。  
キャラクターごとの固有コストは無く、初期の並びから、コストを払った駒ほど後ろへドリフトしていく。

### コスト
1ターンで「移動（自由）」と「行動」ができ、ターンのコスト＝選んだ行動のコスト。
- 移動のみ / 何もしない: 0
- 通常行動: 2
- 反動行動: 7

### 行動順アルゴリズム（順番ポイント方式）
- 各駒に `steps`（初期 0、順番ポイント）を持たせる。タイブレーク用の `order`（初期順インデックス）は専用フィールドを設けず、**`Turn.charactors` 配列のindexで代用**する（types.md参照）。
- `stepBase` ＝ バトル開始時の駒数（**定数。以後不変**。`Battle.stepBase` に保持。「一巡＝初期駒数」を表す内部値で、行動順以外には使わない）。
- **次の行動者 ＝ `steps` が最小の駒**（同点は配列のindex＝初期順で決着）。`steps`昇順で安定ソートすれば、同点の駒は配列上の相対順＝初期順を保つ。
- 行動後の更新：
  1. 行動結果を適用し、hpが0になった駒を盤から除外する。
  2. 行動した駒の `steps += stepBase + cost`（cost: 0 / 2 / 7）。

これにより、
- `cost=0` の駒は毎巡 `+stepBase` され相対順（初期順）を保つ → 純粋なラウンドロビン（＝行動済み/未行動が一巡して戻る挙動）。
- `cost=C` を払った駒は、cost0の駒に対して毎回 `+C` ぶん後ろへ ＝「コスト分だけ後ろにずれる」。
- 同点は配列index（初期順）で決着 ＝「同コストなら初期順」。

`stepBase` を**定数**にするのが要点。生存数で動的に変えると、駒の死亡前後で同コストでも加算がズレて順序が逆転しうるため、定数で固定する（`stepBase`の絶対値自体は順序に影響せず、正の定数であればよい）。

### 変更される概念
- `Action` の `TimePassing` type は不要（仮想時間の進行が無くなる）。
- `actor` は `action` ではなく `turn` が持つ。
- `Charactor`（types.md）は `WT` / `restWt` を持たず、代わりに `steps` を持つ（順番ポイント。タイブレークは `Turn.charactors` のindex）。
- 各技（skill/行動）は `cost`（0/2/7）を持つ（kniwの `additionalWt` 相当）。
- kniwの「行動Turn / waitTurn」の二重構造・sleepループ・時間経過処理が不要になり、`spendTurn` は「行動適用 → 死亡除外 → steps更新 → 並べ替え → 勝敗判定」に簡素化される。
- `datetime` は Turn の値として履歴用に残す（仮想時間ではなく、そのTurnを記録した実時刻の位置づけ）。

> 「行動済み/未行動の2リスト」は、この `steps` 列を並べ替えたビューとして導出できる（`steps`昇順の先頭が次の行動者）。内部表現は `steps` カウンタ1本とする。


## UI/UX
画像として将棋のコマを入れるのは必要
partyを作るモードとデフォルトのpartyモードの追加

## 開発の下回り
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

