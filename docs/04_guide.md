
# guide 開発

`src/guide`に遊び方の説明をMarkdownで配置した。  
これらを、アプリケーションで表示できるようにしたい。  

## 基本設計

URL設計としては以下の想定。(github pagesなので、`/shougi_tactics`prefixがつく)

- /guide
- /guide/tutorial
- /guide/turbulent
- /guide/offscreen
- /guide/rule
- /guide/piece

上記のうち、`/guide`と`/guide/piece`以外は、`src/guide`にMarkdownがあるので、その内容を組み込んで表示する。  
`/guide`は、遊び方全体の目次となるページで、単にリンクのみを用意する。  
`/guide/piece`は、駒とそれに属する行動などのリストを表示するが、`src/data`ディレクトリの内容をリストアップするイメージ。  

## 技術要素

viteの機能でblobを読み込んで、markdownを解釈しつつ、reactで描画する形を取りたい。  
react-markdownなどが候補だが、機能を満たしつつ、安定したライブラリであれば問題ない。  
ただし、機能過多なものは利用したくない。あくまでviteのbuildの延長で利用可能なものを使う。  
urlのpathは固定なので、基本的に全て静的に解決し、そのpathにHTMLが出力されているのが理想だが、難しければクライアントサイドレンダリングで、404.htmlで解決する方法でも良い。  
viteでmarkdownをするpathに、素のreactを書くpathが混ざるため、技術的に難しいかもしれない。実現が難しければpath設計から見直す。  

## 実装計画

### 採用方針（調査結果）
- **URL/ビルド: 既存`list`/`v1`と同じ静的マルチエントリ方式を踏襲する**。各guide pathごとに`src/pages/guide/.../`に`index.html`+`index.tsx`+`app.tsx`を置き、`vite.config.ts`の`rollupOptions.input`へ登録する。出力は`dist/guide/.../index.html`となり、GitHub Pagesがそのまま`/shogi_tactics/guide/...`で配信する。**404.htmlフォールバックは不要**(「静的に解決」の理想形を満たせる)。markdownを描画するpathも素のreactのpath(`/guide`,`/guide/piece`)も、同じ「1エントリ=1 app.tsx」の枠に収まるため混在の難しさは発生しない。
- **markdown読み込み: Viteビルトインの`?raw`** を使う(`import raw from "../../../guide/tutorial.md?raw"`)。プラグイン不要・buildの延長そのもの。
- **描画ライブラリ: `react-markdown` + `remark-gfm`** を追加する(GFMの表/打消し/タスクリストに対応。軽量・ESM・vite親和。「機能過多なものは避ける」方針に合致)。
- **frontmatter**: `--- title/slug ---`は小さな自前`parseFrontmatter(raw): { title, body }`で分離し、`title`を画面見出し/`<title>`に流用する(gray-matter等の追加依存は入れない)。

### URL/エントリ一覧（追加6エントリ）
| URL | エントリ(html) | script参照 | 内容 |
|---|---|---|---|
| `/guide` | `src/pages/guide/index.html` | `./main.tsx` | 目次。各ページへのリンクのみ |
| `/guide/tutorial` | `src/pages/guide/tutorial/index.html` | `../main.tsx` | `guide/tutorial.md`を描画 |
| `/guide/turbulent` | `src/pages/guide/turbulent/index.html` | `../main.tsx` | `guide/turbulent.md`を描画 |
| `/guide/offscreen` | `src/pages/guide/offscreen/index.html` | `../main.tsx` | `guide/offscreen.md`を描画 |
| `/guide/rule` | `src/pages/guide/rule/index.html` | `../main.tsx` | `guide/rule.md`を描画 |
| `/guide/piece` | `src/pages/guide/piece/index.html` | `../main.tsx` | `data/piece`の駒と各駒のactionを一覧表示 |

- **html実体は静的URL分(6枚)必須**(Viteマルチページの制約: 1入力html=1出力path)。ただし中身はほぼ同一のtrivialなboilerplate(title・`document.title`はmain.tsx側で設定)。`index.tsx`/`app.tsx`は各ページに作らない。

### 共通エントリ（重複排除の要）
- **`src/pages/guide/main.tsx`** を唯一の共通エントリにする。6枚のhtmlは全てこのmain.tsxを参照する(目次は`./main.tsx`、配下は`../main.tsx`)。Rollupは共通モジュールを1チャンクにdedupする。
- main.tsxは`window.location.pathname`で出し分ける(ルータ不要の単純switch): 末尾が`/guide`(/末尾許容)→目次、`/guide/piece`→piece一覧、`/guide/<slug>`→対応mdを描画。
- markdownは**`import.meta.glob("../../guide/*.md", { eager: true, query: "?raw", import: "default" })`** でslug→本文stringのmapを一括取得(`?raw`はVite組み込み)。pathnameから取り出したslugでmapを引く。

### 共通部品
- **`src/components/markdown.tsx`** を新設:
  - `parseFrontmatter(raw): { title, body }`: 先頭`---...---`を正規表現で剥がし`title`のみ抽出する**約10行の自前関数**(ライブラリ不要。`gray-matter`/`remark-frontmatter`は導入しない)。剥がさないと`---`がreact-markdownで水平線描画されるため分離は必須。
  - `MarkdownPage: FC<{ content: string }>`: `parseFrontmatter`でtitle/bodyに分離し、`<Container backLink="/guide/">`でラップ。titleを見出し(＋`document.title`)に、bodyを`<ReactMarkdown remarkPlugins={[remarkGfm]}>`で描画。markdown内の`a`要素は既存の`Link`(urlPrefix付与)へマップする。

### `/guide`(目次)
- main.tsx内の目次viewとして実装。既存`Container`+`Link`で、tutorial/turbulent/offscreen/rule/pieceへのリンクを並べる。`backLink="/"`。

### `/guide/piece`
- main.tsx内のpiece viewとして実装。`pieceRepository.all`を反復し、各駒の`name`/`description`/`MaxHP`/`move`と、内包する各`action`(`name`/`description`/`cost`/`baseDamage`/`reachLength`/`effectLength`)をMUI(Card/Table等)で表示する。
- **データ取得方針(確認済み)**: guideは読み取り専用の静的ページでbattle(Dexie)初期化を要さないため、`BattleIO`で包まず`pieceRepository`を直接importする。step14-5の「memory repository直接import全廃」はBattleIO内のbattle系componentが対象のため、guideは対象外と整理。
- 駒画像(step19)はスコープ外。

### 導線
- ホーム(`src/pages/app.tsx`)の「遊び方やルールはGitHub参照」リンクを、アプリ内`/guide`へのリンクに差し替える。

### 設定/型
- `vite.config.ts`: 上記6 input追加。html出力pathは`src/pages`からの相対で決まるため`guide/tutorial`等のネストもそのまま反映される。
- `?raw`(string)/`import.meta.glob`の型は`vite/client`参照で解決済み。react-markdownは自前の型を同梱。
- 依存追加: `react-markdown` / `remark-gfm`(素の`npm install`。workspace不可)。

### 作業順序(各完了でbuild/test green)
1. 依存追加(react-markdown, remark-gfm)。
2. `components/markdown.tsx`(parseFrontmatter + MarkdownPage)。
3. `src/pages/guide/main.tsx`(pathname出し分け + import.meta.glob + 目次view + piece view)。
4. 6枚の`index.html`(目次/4md/piece。main.tsxを参照)。
5. `vite.config.ts`へ6エントリ登録。
6. ホームに`/guide`導線追加。
7. build/test/lint_check/format_check をgreen確認。

### 留意点
- format scriptのglobは`src/**/*.ts`で`.tsx`を含まない(既知)。新規`.tsx`はprettier対象外・eslint対象。
- markdown内の`(TODO)`リンクは現状プレースホルダのまま(相互リンク/画像はstep19/別途)。

## 済み分（実装メモ）
- 依存追加: `react-markdown@10` / `remark-gfm@4`(素の`npm install`)。
- **静的マルチエントリで実装(404不要)**。`vite.config.ts`の`rollupOptions.input`へ6エントリ追加(`guide` / `guide/{tutorial,rule,turbulent,offscreen,piece}`)。出力は`dist/guide/.../index.html`。html実体6枚は静的URL用の最小boilerplate(各`<title>`のみ差異)。
- **命名はlist/v1慣習に踏襲**(`index.tsx`=createRootするentry/htmlが読む、`app.tsx`=`App`コンポーネント本体)。
- **目次+markdown4ページは共通の`src/pages/guide/{index.tsx,app.tsx}`を共有**。5枚のhtml(`guide` `guide/{tutorial,rule,turbulent,offscreen}`)は同じ`index.tsx`を参照(目次は`./index.tsx`、配下は`../index.tsx`)。`index.tsx`は描画のみの薄いentry、`app.tsx`の`App`が`window.location.pathname`から'guide'の次セグメント(slug)で出し分け(なし→目次 / その他→`markdownBySlug[slug]`を`MarkdownPage`で描画 / 不一致→NotFound)。
- **`/guide/piece`は独立ページ**: `src/pages/guide/piece/{index.tsx,app.tsx}`(他pageと同形。`index.html`は自前の`./index.tsx`を参照)。素のreactで駒一覧を描画するため共有dispatcherから分離(dispatcher側にpiece分岐は持たない。目次のリンクのみ残す)。
- markdownは`app.tsx`で`import.meta.glob("../../guide/*.md", { eager:true, query:"?raw", import:"default" })`一括取得→slug→本文stringのmap化。Rollupが共通`guide.js`チャンクへdedup(markdown本文も埋め込み)。piece は独立の`piece.js`チャンク。
- **`components/markdown.tsx`**新設: `parseFrontmatter`(先頭`---...---`を剥がしtitle抽出。約10行・ライブラリ不要・非export)と`MarkdownPage`(frontmatterのtitleは`document.title`専用にuseEffectで設定。本文先頭`# 見出し`がページ見出しを兼ねるので別途見出しは出さない。`a`要素はhttp(s)を`_blank`、各要素をMUI Typographyへマップ)。
- **`/guide/piece`はBattleIO非依存**で`pieceRepository`を直接import(読み取り専用・Dexie初期化不要)。各駒のname/description/MaxHP/moveと内包actions(name/description/cost/baseDamage/reach/effect)をMUI Card+Tableで表示。
- 導線: ホーム(`pages/app.tsx`)のGitHubリンクをアプリ内`/guide`へ差し替え、「遊び方」リンクboxを追加。
- lint: react-refresh/only-export-componentsを既存パターンで回避(`markdown.tsx`はMarkdownPageのみexport / guideはcomponentを`app.tsx`へ集約しexport・`main.tsx`は描画のみ)。
- 検証: build / test(126) / lint_check(0 warning) / format_check すべてgreen。
- ⚠ `react-markdown`導入と無関係に、既存`vite@8.0.14`にhigh severity advisory(Windows限定: launch-editor NTLM/`server.fs.deny`バイパス)あり。`vite@8.1.0`で解消だがstated rangeを超えるため未対応(dependabot領域)。

