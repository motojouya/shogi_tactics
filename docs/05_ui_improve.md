
# UI改善

## レビュー

### その他
- 駒の画像が表示されていない

### 全体
- `将棋タクティクス`という文字列が長くて、ヘッダで折り返しで表示されている
- ヘッダには戻るボタンも出るのでそこの幅もケアしたい

### トップページ
- トップページから、`/guide` `/list` への2つのリンクがあるが、`/guide/tutorial`と`/v1`への導線もあるべき。というかそっちがメイン
  `/guide/tutorial`は説明文の中でいい。`/v1` `/list` `/guide`への3つを順に並べる感じが良さそう。その3つはボタンにしたい

### guide
- `/guide/*`以下のindex.htmlが`/index.tsx`を参照していて、期待する画面が表示されない
- `駒と行動の一覧` -> `駒の一覧`に変更
- 並び順の調整`遊び方` `戦乱モード` `駒の一覧` `アプリなしでの遊び方` `ルール`にする

### list
- 勝利者名は、player nameを表示する
- deleteボタンは、削除と表示

### v1
- 説明が`Start The Battle`だが、日本語がいいし、意味的にも対戦の設定的な文言がふさわしい
- 入力欄の名前が英語になっている。Modeはそのままでいいが、先手の名前、後手の名前がいい
- stepBaseは基礎コスト、unit countはユニット数かな
- ボタン名が`Start Battle`になっている。`戦闘開始`がいいかな。戦乱モードでは`ユニット選択`

### v1 key
- turn numberの表示は不要そう。巻き戻しとかしだすと、余計混乱するし
- Action Ordersへの表示追加。リーダアイコン、ステータスバッヂ、駒画像
- Action Ordersのstepsはcostにしようか。加算されるイメージのほうが良さそう
- `Action Orders 1`が目立ちすぎる。単に`1`でいいし、1行に収まる形のほうがいい
- unitのpiece詳細は、アコーディオンで開けるようにしたい。
- moveはアコーディオンではなく、表示追加のほうに追加してもいいかも。幅の余裕による
- アコーディオンではアクションのリストを表示。表示項目は以下
  - 行動名
  - 説明
  - 基本ダメージ
  - 対象ユニット数
  - コスト
  - 到達範囲
  - 対象範囲
- 技選択画面で、行動ユニットの詳細は表示不要。下のAction Orderで見えるので
- 技と対象ユニットを選択したら、hp変化と除外されるかどうかだけ表示したい
- 技選択で、コストだけ選択肢の中に表示してしまいたい
- 対象ユニット選択にhp変化と除外されるかを表示したら、便利。それなら下に表示する必要がない

### v1 key units
- `大将`ではなく`リーダー`にする
- 選んだ駒の行動順を番号をつけておく
- `start battle`ではなく、`戦闘開始`

### guide/piece
- actionの表において、到達と影響は不要。その代わりにマス目の範囲表示を行う
- 駒画像
- 駒名がいるね。pieceに項目を足して将棋の駒名を付与し、追加したい

## plan

以下の4つにPRを分ける

### guideのjs
guide配下のjs指定の修正。どの画面でも表示されることがゴール。

### 戦闘中画面
pieceへの駒名追加と表示。guideと戦闘中とユニット選択中
戦闘中画面の調整。特にアコーディオンの導入など、UIが構造的に変化するので先に行う。

### 駒画像の導入
以下画面で駒画像を導入
- v1のユニット選択中
- v1の戦闘中
- guide/piece

画像は以下を使う。先手後手でも別れるのでそこも  
https://sunfish-shogi.github.io/shogi-images/

また、guide以下の解説の画像も用意して表示する。
画像生成がclaudeできないのでどうすべきか。将棋盤画像と駒画像はあるので、それにcanvasを組み合わせて簡単な図はかけないだろうか。
いずれにしろ、駒の配置とかは自然な形になるように、自分で動かして配置を考えておく必要がある。
紙をどう扱うかの画像だけはそれではできないので、chatgptでの生成でもいいかも

### UI調整
その他すべて。基本的な文言や、サイズ感など。ここでUIは調整しきりたい

## 戦闘中画面PR 実装計画（確定スコープ）

plan「戦闘中画面」の確定スコープ。**piece駒名の追加＋表示**と**戦闘中画面の構造変更**に集中する。駒画像と基本文言/サイズは別PR。

### 今回やる（IN）

1. **pieceに将棋駒名フィールド追加**
   - `model/piece.ts` に将棋駒名のフィールドを追加（現`name`はゲーム名「将軍/軽弓」等なので別フィールド。例: 王将/飛車/角行…）。
   - `data/piece/*.ts` 全駒へ値を設定。
   - 表示: guide/piece・戦闘中(action.tsx)・ユニット選択中(formation.tsx) の3画面。
2. **共通「行動表」コンポーネント**（component層に新設）
   - 列: 行動名 / 説明 / 基本ダメージ / 対象ユニット数(receiverCount) / コスト(cost) / 到達範囲 / 対象範囲。
   - 到達範囲=`reachRange`(7×7)、対象範囲=`effectRange`(3×3) を **マス目グリッドで可視化**（数値ではなくグリッド描画。レビュー58を反映）。
   - guide/piece と 戦闘中アコーディオン内で**同一コンポーネントを共用**。
3. **戦闘中画面(action.tsx)の構造変更**（レビュー33–50, ※画像除く）
   - turn number 非表示(33)。
   - Action Orders: steps→**cost**表記(35) / `Action Orders 1`→`1`の1行コンパクト化(36) / リーダアイコン・ステータスバッヂ追加(34, **画像は別PR**)。
   - unit詳細を**アコーディオン化**(37)。`move`はアコーディオン外の表示に追加(38)。アコーディオン内に上記**共通行動表**(39–46)。
   - 技選択: 行動ユニット詳細を非表示(47) / 技選択肢に**cost**表示(49) / 技+対象選択時に**hp変化と除外のみ**プレビュー(48,50, `model/simulation.ts`の`simulate()`再利用)。
4. **guide/piece**: 将棋駒名の表示 + アクション表を上記**共通行動表**に差し替え（マス目グリッド, 58反映）。

### 今回やらない（別PR）

- **駒画像すべて**（駒画像PR）: 34の画像 / 59 / 各画面の駒画像。
- **文言・サイズ調整**（UI調整PR）: 大将→リーダー(53) / `戦闘開始`等の文言(30,55) / **ユニット選択中の行動順番号(54)** / ヘッダ折返し(10–11) / トップ導線(14–15) / guideのリネーム・並替(19–20) / list(23–24) / v1の各種文言(27–30) / guide/pieceタイトル`駒と行動の一覧`→`駒の一覧`(19)。

### 補足
- 構造変更（アコーディオン導入等）を先行させる方針のため、文言/サイズはあえて後段のUI調整PRへ送る。
- 共通行動表は1コンポーネントに集約し、guide/pieceと戦闘中アコーディオンの二重実装を避ける。

### 済み分（実装メモ）
- **piece将棋駒名**: `model/piece.ts`に`shogiName: string`を追加。`data/piece/*.ts`全14駒へ各ファイル先頭コメントの駒名を設定（王将/金将/銀将/飛車/角行/桂馬/香車/竜王/竜馬/成銀/成桂/成香/歩兵/と金）。テストのPieceリテラル(unit/action/formationの各.unit.test.ts)にも補完。
- **共通行動表**: `src/components/action_table.tsx`新設（`ActionTable: FC<{ actions }>`）。列= 行動/説明/基本ダメージ/対象数/コスト/到達範囲/対象範囲。到達=`reachRange`(7×7)・対象=`effectRange`(3×3)を`RangeGrid`(local)でマス目グリッド描画。bit意味付け(bit0=影響→青塗り, bit1=Actorマス→赤枠)を凡例つきで表示。guide/piece と 戦闘中アコーディオンで共用。
- **guide/piece(`pages/guide/piece/app.tsx`)**: 駒名見出しに`（{shogiName}）`を併記。旧inline tableを`ActionTable`へ差し替え。タイトルは据え置き（リネームはUI調整PR）。
- **戦闘中(`feature/action.tsx`)**: `GameStatus`からturn番号を除去。`UnitStatus`を廃し、Action Ordersを`ActionOrderEntry`(MUI Accordion)へ刷新——サマリ=`{order+1}`/リーダ★(`StarIcon`)/`name（shogiName）`/HP/コスト(=unit.steps)/移動/状態Chip、詳細=`ActionTable`。技選択は、行動主の詳細表示を撤去し、技選択肢に`（コスト{cost}）`を併記、技+対象選択のプレビューを各receiver直下に`HP before→after（除外）`だけ表示（`simulate()`再利用、before=lastTurnのhp）。
- **ユニット選択中(`feature/formation.tsx`)**: 配置済みリストの駒名に`（{shogiName}）`併記（大将→リーダー文言はUI調整PR）。
- 検証: build OK / test 126 passed / lint 0 warning / format OK。
- ※視覚確認は`npm run dev`で /guide/piece と戦闘中画面を要目視（アコーディオン展開・グリッド表示・プレビュー）。

## 駒画像の導入PR 実装計画（確定スコープ）

plan「駒画像の導入」を実施。**駒画像**(3画面)に加え、**guide解説画像**(盤面図3枚+紙の図1枚)も含める。

### 確定した方針
- **画像ソース**: `sunfish-shogi/shogi-images`(CC0, 帰属不要)。スタイルは`futamoji`(二文字)。
- **配置**: `public/`へDL同梱(オフライン/PWA対応, 外部依存なし)。
  - `public/piece/futamoji/{black,white}_*.png`(14駒×2=28枚, 先手=black/後手=white。white画像は180°回転済み)。
  - `public/board/light_458x500.png`(9×9盤, 259KB)。
- **解説図の描画**: `<img>`経由SVGは外部画像を読めない制約があるため、**インラインReactの盤面図**で「盤画像＋駒画像」を合成(DOM内描画なので制約回避)。個別駒SVGは非提供(スプライトのみ)のため不採用。

### 済み分（実装メモ）
- **駒画像の解決**: `src/components/piece_image_src.ts`(非component)に`pieceImageSrc(key, side)`とkey→画像名mapを集約。成り駒のみ別名(`promoted*`→`prom_*`)。`src/components/piece_image.tsx`の`PieceImage`がこれを利用。
- **駒画像の組込(3画面)**: guide/piece(`pages/guide/piece/app.tsx`, 見出し横, side無→先手)/ユニット選択中(`feature/formation.tsx`, 配置済みリスト, unit.side)/戦闘中(`feature/action.tsx`, Action Ordersサマリ・行動主ターン見出し, unit.side)。後手はwhite=180°回転で表示される。
- **盤面図コンポーネント**: `src/components/board_diagram.tsx`(`BoardDiagram`)。盤PNGを背景に駒画像を絶対配置。マス目幾何は`public/board/light_458x500.png`を画素解析して実測(縦線x:6..451 pitch49.44 / 横線y:6..493 pitch54.11)。highlight(配置可能範囲)・arrow(足止め)のSVGオーバーレイ対応。
- **guide解説図**: `src/components/guide_diagram.tsx`(`GuideDiagram`)で4図を定義——`initial`(初期配置)/`ashidome`(足止め, 矢印+金マス強調)/`placeable`(配置可能マス, 上下2行ハイライト)/`cost-paper`(紙の行動順メモ。初期順+加算コスト例, 最小コストに「次の番」)。配置は各markdownのASCII/説明に対応。
- **markdown連携**: `src/components/markdown.tsx`に`img`コンポーネントを追加し、`![alt](diagram:KEY)`を`GuideDiagram`へ振り分け(それ以外は通常img)。独自スキームのため`urlTransform`はidentityに。`src/guide/{tutorial,turbulent,offscreen}.md`のimgプレースホルダを`diagram:`記法へ置換(既存ASCIIは併記で残置)。
- 検証: build OK / test 126 passed / lint 0 warning / format OK。初期配置を実画像で合成しマス整合を目視確認済み。
- ※要目視(`npm run dev`): /guide の tutorial(初期配置・足止め)/turbulent(配置可能)/offscreen(紙)、各駒画像の表示。後手駒の180°回転表示がリスト文脈で許容かも確認。

