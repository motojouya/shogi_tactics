
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

## 2. ライブラリ導入  
web,core,ルートにライブラリを入れていく  
基本的に現時点の最新をライブラリのガイダンスに従って導入する  
付随して必要なライブラリも入れていく  
ライブラリ導入のゴールとしてはbuildもテストも通ること  

- mui
- react
- vite
  npm create vite@latest
- vitest
- eslint
- prettier
- dexie
- date-fns
- vite-plugin-pwa
- react-hook-form
- zod

`.npmrc`を用意
```
ignore-scripts=true
min-release-age=7
```

package.jsonの依存関係は消してinstall
```
npm install -D vite vitest eslint vite-plugin-pwa
npm install --save-dev --save-exact prettier
npm install react react-dom dexie dexie-react-hooks date-fns react-hook-form zod @mui/material @emotion/react @emotion/styled @mui/icons-material @fontsource/roboto
```

## 3. core移動
coreの内容をwebに移動する。  
src,test配下をmergeしていくイメージで、src,test配下に同名のディレクトリがあれば、混ぜる。  
同名のファイルがある場合は、内容をmergeし、上書きはしない。  
build,testは最後に通れば問題ないが、作業はディレクトリごとに行う。  
ライブラリは、coreのライブラリはすべてwebに入っているはずなので、特に調整不要なはず

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

ファイルごと削除
- ability.ts
- acquirement.ts
- field.ts
- random.ts
- status.ts

項目削除
- character.ts
  - weapon
  - clothing
  - blessing
  - race
  - statuses
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
- turn.ts
  - field
  - randoms

項目をすべて移動
- physical.tsの残りの項目はcharacter.tsに移動

## 6. ディレクトリ統廃合
- model -> 何もしない
- store -> repositoryに命名変更
- store_data -> dataに命名変更
- store_schema -> 何もしない
- store_utility -> ファイルをrepositoryに移動
- components -> 何もしない
- form -> 何もしない
- io -> storeに命名変更
- pages -> 何もしない
- procedure -> controllerに命名変更
- subpage -> featureに命名変更

## 7. testコロケーション
testファイルはすべて`.unit.test.ts`という拡張子とし、src配下のテストファイル対象と同じディレクトリに配置する。

## 8. party.tsの削除
partyの内容はbattleに統合するので、character[]をbattleに埋め込んだうえで、party.tsを削除する。  
partyを作る画面があるが、これはbattleのstepとしてpartyを作る段階を用意するので、battleの画面で出し分ける感じになる。  
partyを作る段階とは、battleのturn[]のlengthが0の状態で、partyを作り終えたのであれば、turnに1つ追加する。これを条件としてparty作成画面を出し分ける。  

## 9. skillの参照
skillはcharacterに埋め込まれた形で参照されるが、character上はkeyのみを持ち、controllerでskill実態を参照する。  
各ロジックには、選択したskillを渡す感じにしていく。  
character上のskillの埋め込みを削除したうえで、ロジックを成り立たせるように修正する。  

## 10. store_schema削除
store_schemaの実装内容は、modelの同名ファイルに移動する。  
また、modelの型情報をzodの型情報から導出できるように修正する。  

## 11. 時間経過ロジックの変更
kniwでは時間経過は仮想的な時間の経過を持って表現していた。  
これを行動のポイントで算出する。技の実行コストを設定し、行動しなければ0として、そのコスト分だけ順番が後ろにずれる感じ。  
キャラクターごとの行動コストなどはないので、最初の並びからどんどんズレていくようなイメージ。  

これによって以下の概念が変更される
- actionのTimePassingというtypeが不要
- actionのactorはactionが持つのではなく、turnが持つように習性する
- characterのWT,restWtというのが不要

turnの持つ項目が、行動済みのcharacterと未行動のcharacterに別れて、移動していく。
未行動がなくなったら、行動済みを未行動に移して、その繰り返し。

