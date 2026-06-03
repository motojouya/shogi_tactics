
# 開発計画

大きく以下の内容
1. kniwをコピーして体裁を整えていく
  https://github.com/motojouya/kniw
2. 機能の実装整備
3. ドキュメントの整備

## 1.kniwのコピー
以下に定義
[kniwコピー](./copy.md)
先にclaudeに計画の精査をしてもらう。曖昧な部分、間違っている部分、誤解を生む表現、調べたほうがいいことなど。
claudeに作業してもらうのは、3のファイル移動から

## 2.機能実装
未検討
画像として将棋のコマを入れるのは必要
時間経過ロジックがポイントベースになるのでだいぶ変化するはず
技について影響距離と到達距離の項目追加
partyを作るモードとデフォルトのpartyモードの追加
visitor,homeをfirst,secondに変更する。またプレイヤー名を入力できるようにしてだれがfirst,secondか分かるように
party登録の際は、second->firstの順で交互にコマを登録していくので、その順序で
version管理したい。pathごとにversionを定義する感じ。一覧はversionなしで、battle自体がversionをもって、特定のpathに行くイメージ。なので一覧のpathは別にして、versionごとのpathを切る。そこでversionの変数を定義してアプリケーションにわたすイメージ
dependabotの導入

## 3.ドキュメント整備
未検討
markdownで書いてHTMLに変換したいが、reactで直書きのほうがいいかも
markdownから変換するツールはいろいろありそうだが、装飾が面倒かもしれない

## 設計
kniwはモノレポだが、通常のプロジェクトにする
webのみ

### Directory
- docs  
  ドキュメント  
- src  
  - model  
    ドメインモデル  
  - data  
    データ主にskillとコマリストを定義  
  - form  
    入力formのデータモデル  
  - store  
    dexieを使ってindexeddbアクセスを行うモジュールだが不要かも  
  - repository  
    battleとskillとコマのrepository  
  - controller  
    ロジック定義  
  - component  
    画面の部品  
  - feature  
    機能であり実際のページの概念  
  - page  
    featureに振り分けるがurlはこちらに紐づく  
- test  
  playwrightのテスト  

### その他
CIはkniwと同じにする

