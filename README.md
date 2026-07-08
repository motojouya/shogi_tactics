
# 将棋タクティクス

## What Is This

`将棋タクティクス`は、将棋盤の上で駒を動かして、相手プレイヤーとの勝敗を決めるボードゲームです。  
ただ駒の動かし方が将棋とは異なり、独自のルールや仕組みもあります。  

タクティクスオウガ(Tactics Ogre)というゲームが好きで、ボードゲームでも遊びたくて作りました。  
タクティクスオウガのゲームシステムを再現するために、アプリケーションを使う必要があるために、このプロジェクトを用意しています。  

アプリケーションはGithub Pagesで動くPWAです。遊び方などの解説も、アプリケーションに組み込んでいます。  
https://motojouya.github.io/shogi_tactics/

以降、アプリケーションの構成について説明していきます。  

## Directory

- /
  - .github/
    - workflows/
      - check.yml  
        開発時のチェックがある。通らないとmerge不可  
      - gh-pages.yml  
        github pagesの機能を使っているのでそのbuildを行う  
  - docs/  
    ドキュメント  
  - src/
    - model/  
      データモデル、メインロジック  
    - data/  
      データの定義。駒、駒のアクション、駒に付与する状態を定義  
    - form/  
      入力formのデータモデル  
    - repository/  
      保存したデータやマスタデータを出し入れする  
    - controller/  
      form,model,repositoryを使って機能を実現する  
    - components/  
      画面の部品  
    - feature/  
      機能を実装した画面を定義する。特定のpathでも状態によって画面が違い、その単位での画面の定義。  
    - pages/  
      featureに定義した画面を、query stringや状態によって出し分けて表示する。こちらはpath単位で定義されている。  
    - guide/  
      アプリケーションの使い方やゲームの遊び方を説明するドキュメントでHTMLに変換される文章  
    - public/  
      主に画像などの静的ファイルの配置  
  - test/  
    統合テスト  
  - package.json  
    開発コマンドが定義されているので要確認  

単体テストは、対象のファイルと同じディレクトリに配置する  
統合テストの実行前には以下が必要  
```
npx playwright install chromium
npx playwright install-deps chromium
```

## Model
データモデルは主にマスタ系と、実際に変化していくトランザクション系がある。  
トランザクションデータはマスタを参照して、ロジックを実現している。  

- マスタ  
  - Piece  
    駒の種類を定義する。実際に動かす駒はunitと呼び、unitはpieceという属性を持っている  
  - Action  
    特定のPieceが取れる行動を定義する  
  - Status  
    unitに付与する状態を表現する  
- トランザクション  
  - Battle  
    対戦本体。内部は構造的になっていて、unitも組み込まれている  

### Battle Lifecycle
Battleはライフサイクルがある  

```mermaid
stateDiagram-v2
    [*] --> 編成中: battleを作成
    編成中 --> 対戦中: 編成完了
    state if <<choice>>
    対戦中 --> if: 行動選択
    if --> 対戦中: 決着つかず
    if --> 決着済み: 決着つく
    決着済み --> [*]
```

## 画面
urlのpathごとの画面ではなく、機能ごとの画面のこと。pathの単位と一致しない。  
ディレクトリでいうと、src/pagesとsrc/featureを組み合わせて表現される。  
以下の画面がある。  

- `/shogi_tactics/`  
  トップ画面  
- `/shogi_tactics/list`  
  battleのlistを表示する  
- `/shogi_tactics/v1`  
  query stringがない場合、version1のbattleを作成して開始できる  
- `/shogi_tactics/v1?key=...` battleが編成中  
  特定のbattleの編成画面が表示される  
- `/shogi_tactics/v1?key=...` battleが対戦中/決着済み  
  特定のbattleの決着状態が表示される。対戦中なら行動選択機能も  
- `/shogi_tactics/guide/*`  
  ゲームの遊び方の解説。`/guide` `/guide/piece`はreactのみだが、他のページはMarkdownで記載している。  

