
# kniwのコピーの作業

## 1. コピー
ここは単にコピーして特定のファイルを削除するのみ

- kniwをgit clone
- packages/commandディレクトリ削除
- .git削除
- package-lock.json削除
- github actionsはファイルは残しておきたいがworkflowは無効化しておきたい。triggerをworkflow_dispatchにすればいいかな
- CLAUDE.md作成
- git repository登録

作業済み

## 2. ライブラリ導入  
web,core,ルートにライブラリを入れていく  
基本的に現時点の最新をライブラリのガイダンスに従って導入する  
付随して必要なライブラリも入れていく  
ライブラリ導入のゴールとしてはbuildもテストも通ること  

- mui
- react
- vite
- vitest
- eslint
- prettier
- dexie
- date-fns
- vite-plugin-pwa
- react-hook-form
- zod

### サプライチェーン対策（A1）
npmネイティブの機能で対応する。`.npmrc`を用意する。
```
ignore-scripts=true
min-release-age=7
save-exact=true
```
- `min-release-age=7`: 公開後7日未満のバージョンを入れない（smash-and-grab型の汚染版を回避）。**これはpnpm専用ではなく、npm 11.10.0以降でネイティブサポートされる**。node 22の同梱npmは10.x系なので、利用前に`npm install -g npm@latest`等で**npmを11.10.0以上に上げる必要がある**。CIでも同様にnpmを上げるステップが要る（00_planのworkflow見直しに含める）。
  - 緊急のセキュリティ修正を入れたい場合、npm版には除外機構が無いため、一時的にこの設定を外して対応する想定。
- `ignore-scripts=true`: 依存のinstall時スクリプト（postinstall等）の実行を止める。ただしesbuild等はこれで壊れるため、A2で個別対応する。
- `save-exact=true`: バージョンを完全固定し、想定外の版が混入しないようにする（prettierの`--save-exact`と整合）。
- 追加で、install後に`npm audit signatures`でレジストリ署名/provenanceを検証する運用も入れておくとよい。
- 自動更新は別途dependabotのcooldown設定で`min-release-age`と揃える（00_planの2.機能実装に記載済み）。

package.jsonの依存関係は消してinstall
```
npm install -D vite vitest eslint vite-plugin-pwa typescript @types/react @types/react-dom @types/wicg-file-system-access @vitejs/plugin-react typescript-eslint @eslint/js globals eslint-plugin-react-hooks eslint-plugin-react-refresh
npm install --save-dev --save-exact prettier
npm install react react-dom dexie dexie-react-hooks date-fns react-hook-form @hookform/resolvers zod @mui/material @emotion/react @emotion/styled @mui/icons-material @fontsource/roboto
```

### 依存の取りこぼし対応（A3）
当初リストから漏れていた以下を追加済み（現コード・lint・ビルドで実際に使用しているため）。
- 実行時: `@hookform/resolvers`（react-hook-form + zod のバリデーションリゾルバ。`components/battle.tsx`,`party.tsx`で使用）
- 型/ビルド: `typescript`、`@types/react`、`@types/react-dom`、`@types/wicg-file-system-access`（`showSaveFilePicker`等の型。`io/indexed_database.ts`で使用）、`@vitejs/plugin-react`（vite.config.tsで使用）
- lint: `typescript-eslint`、`@eslint/js`、`globals`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`（いずれも`eslint.config.js`が読み込む。無いとlintが起動不可）

入れないもの（現コードで未使用 or 不要）。
- `tslib`（tsconfigに`importHelpers`設定が無く未使用）
- `react-icons` / `next-themes`（使用箇所なし）
- `@motojouya/kniw-core`（ワークスペース内部参照。統合後は不要）
- `vite-tsconfig-paths`（相対パスに寄せる方針のため不要。tsconfigに`paths`/`baseUrl`も無く実質no-op。**あわせて`vite.config.ts`から`import tsconfigPaths from "vite-tsconfig-paths"`と`plugins`内の`tsconfigPaths()`を削除する**こと）

### postinstallの扱い（A2）
`ignore-scripts=true`にすると、postinstallでネイティブバイナリを用意するライブラリが壊れる。  
このリストで該当するのは実質**esbuild**のみ（vite/vitestがesbuildに依存。rollupのネイティブ部分はoptionalDependenciesで配布されるためscript無効でも問題なし、その他のmui/emotion/dexie/date-fns/react系/zod/eslint/prettier/vite-plugin-pwaはpostinstall不要）。  
対応として、esbuildを使うviteのinstallだけ`--ignore-scripts`を外して単独で実行する。  
ただしnpmは「新規にインストールされたパッケージ」しかscriptを実行しないため、先に他をignore-scriptsで入れてしまうと後からviteを入れてもesbuildのpostinstallが走らないことがある。確実を期すなら、最後に`npm rebuild esbuild`を明示的に実行してバイナリ/binを整える。

これは問題なさそう。esbuildはbuildされたバイナリが入るらしい。とりあえずvite単独で最初にやってみて、必要なら最後に`npm rebuild esbuild`を入れる感じで。

### バージョン移行（A4）
「現時点の最新を導入」した結果、メジャー跳ね上がりによる破壊的変更の対応が必要になる。  
特に**zod 3 -> 4 のmigrationは独立した作業**として発生する（`store_schema`配下が`z.object`/`z.infer`/`z.number().int()`等を多用しており、zod4で型推論・APIに破壊的変更がある）。  
「最新ライブラリの導入」と「zod migration（およびmui等のメジャー移行）」は別作業として扱い、ビルドを通す工程に組み込む。

### 導入場所と順序（A5）
web/core/rootの3箇所に入れるのは、3・4の統廃合でcore->web->rootへマージ・移動する都合上の一時的な重複であり、各ステップでビルドを確認しながら進めるため許容する（最終的にrootへ集約される）。

## 3. core移動
coreの内容をwebに移動する。  
src,test配下をmergeしていくイメージで、src,test配下に同名のディレクトリがあれば、混ぜる。  
同名のファイルがある場合は、内容をmergeし、上書きはしない。  
build,testは最後に通れば問題ないが、作業はディレクトリごとに行う。  
ライブラリは、coreのライブラリはすべてwebに入っているはずなので、特に調整不要なはず

移動の際は、import指定子の書き換えも同時に行う。  
webからcoreを参照していた`@motojouya/kniw-core`の参照を相対パス（or エイリアス）に書き換え、core内の相対パスも移動先に合わせて修正する。  
移動完了後に`web/package.json`から`@motojouya/kniw-core`依存を削除する。  
ディレクトリを一つ移動するごとにimportを修正し、その都度ビルドが通るか確認する。作業量は多いが、確認しながら正確に行うことに価値がある。

- io
- model
- store
- store_data
- store_schema
- store_utility

## 4. rootへ移動
webの内容をrootに移動する。  
単純にsrc,testをroot配下に持って来る。publicは不要なので削除。  
npm workspaceを使っているので、node_modulesはroot配下にあるはずで、package.jsonだけ書き換えれば問題なさそうだが、npmコマンドで移行できればそうする。  
こちらも、build,testはすべてのディレクトリを移動し終えたら確認する。  
あわせて、root`package.json`の`workspaces`配列と`name`(`@motojouya/kniw`系)、tsconfig（web側の`tsconfig.app.json`/`tsconfig.node.json`とcore側tsconfig）の統合を行う。  
3と同様、importの書き換えはディレクトリごとに行い、その都度ビルドを確認する。  
root集約後、全ソースが揃った状態でzod migration（3 -> 4。step2のA4参照）を独立した作業として実施し、ビルド・テストを通す。  

- model
- store
- store_data
- store_schema
- store_utility
- components
- form
- io
- pages
- procedure
- subpage

## 5. model削除
modelの構造体や項目を削除していく。削除対象のファイルごとに、buildとtestを確認していく。
したがって、削除に伴って、他のロジックなども修正していく感じになる。

modelファイルの削除は、それを参照する`store_data`配下（acquirement/ability/status等のデータ定義群）、`store`、`store_schema`、および対応するtestを連鎖的に削除/修正する必要がある。  
連鎖して消すべきものは事前にすべて列挙するのではなく、一つ削除するごとにビルドエラーを手がかりに調査しながら、連鎖対象を特定して削除していく。  
ビルドが通る状態をキープしながら検証することがこのステップの目的なので、作業量は多いが一つ一つ確認しながら正確に行う。

ファイルごと削除
- ability.ts
- acquirement.ts
- field.ts
- random.ts

項目削除
- character.ts
  - weapon
  - clothing
  - blessing
  - race
  - mp
- physical.ts
  - MaxMP
  - STR
  - VIT
  - DEX
  - AGI
  - AVD
  - INT
  - MND
  - RES
  - StabResistance
  - SlashResistance
  - BlowResistance
  - FireSuitable
  - RockSuitable
  - WaterSuitable
  - IceSuitable
  - AirSuitable
  - ThunderSuitable
  - jump
- skill.ts
  - type
  - action
  - directType
  - magicType
  - mpConsumption
  - getAccuracy
- status.ts
  - wt: number;
- turn.ts
  - field
  - randoms

項目をすべて移動
- physical.tsの残りの項目はcharacter.tsに移動

## 6. ディレクトリ統廃合
- model -> 何もしない
- store -> repositoryに命名変更
- store_data -> dataに命名変更
- store_schema -> 何もしない（step10でmodelの同名ファイルへ吸収して消える前提。このステップでは温存する）
- store_utility -> ファイルをrepositoryに移動
- components -> 何もしない
- form -> 何もしない
- io -> storeに命名変更
- pages -> 何もしない
- procedure -> controllerに命名変更
- subpage -> featureに命名変更

## 7. testコロケーション
testファイルはすべて`.unit.test.ts`という拡張子とし、src配下のテストファイル対象と同じディレクトリに配置する。  
あわせて、vitestのinclude設定が`*.unit.test.ts`を拾うように修正し、tsconfigのexcludeで`*.unit.test.ts`がビルド出力に含まれないようにする。  
（CLAUDE.mdの方針どおり、単体テストはコロケーション、`test/`配下は統合テストとする。）

## 8. party.tsの削除
partyの内容はbattleに統合するので、character[]をbattleに埋め込んだうえで、party.tsを削除する。  
partyを作る画面があるが、これはbattleのstepとしてpartyを作る段階を用意するので、battleの画面で出し分ける感じになる。  
partyを作る段階とは、battleのturn[]のlengthが0の状態で、partyを作り終えたのであれば、turnに1つ追加する。これを条件としてparty作成画面を出し分ける。

### Battle / Turn のデータ型（F/G）
データ型の定義は `types.md` に集約する（`Battle` / `Turn` / `Charactor` / `Action` / `CharactorReference` 等）。要点のみ：
- `Roster` は廃止。プレイヤー名は `Battle.first_player_name` / `second_player_name` として持ち、駒は `Turn.charactors`（全生存駒の1リスト、`steps`昇順＝行動順）に集約する。`side` で陣営を区別。
- `Charactor` は `{ piece, hp, side, steps, statuses }`（駒種キーのみ保持、skill実体は持たない。step9参照）。
- `Battle.turns.length === 0` がparty作成段階（画面出し分け条件）。party確定で先頭Turnを1つ追加する。先頭Turnの `actor` は null 許容（行動前）。
- `Battle` は `stepBase`（step11のBASE＝開始時総駒数の定数）と `version` を持つ。

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

## 10. store_schema削除
store_schemaの実装内容は、modelの同名ファイルに移動する。  
また、modelの型情報をzodの型情報から導出できるように修正する。

> NOTE: schemaをmodelに取り込むと、model -> store(repository) -> model のような循環依存が生じる可能性がある（現状はstore_schemaが中間層として循環を断っている）。step5・9でacquirement等のrepository参照が消えていれば回避できる見込みだが、当該タスク着手時に改めて依存関係を調査し、循環が残らないか確認してから進め方を決める。  

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

