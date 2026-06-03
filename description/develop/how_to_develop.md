
# 開発者向けの説明
このゲームをより良くする活動に協力いただける方への説明です。  

## ゲームボードの開発
ゲームボードと駒の作り方は[ゲームボードの作り方](/docs/play/make_game_board.md)ページにて説明しています。  
開発者はソフトウェアプログラマなので、アプリケーションの開発には慣れていますが、物理コンポーネントに関しては素人です。  

駒については、上記のリンク先に書いてある以上のことは検討できていません。  

ゲームボードについては、もう少し整った形を検討しています。  
現在は、A4のボール紙を2枚重ねたものを2つ（つまり4枚必要）用意して、マス目を印刷した紙を貼り付ける形にしています。  

特にマス目を書いた紙のデザインが開発者には難しく、また駒にするキャラクターにも絵柄が必要と考えています。  
このあたりをデザインしてもらえる方を探したいと考えています。  

また、大枠でのゲームデザインについては、[ゲームデザイン](/docs/develop/game_design.md)を参照してください。  
細かいゲームシステムやルールについては、[ゲームシステム](/docs/system/game_system.md)を参照してください。  

## アプリケーションの開発

### 環境構築
環境としては、以下を前提としています。  
- Linux
- Node.js
- npm workspace

Node.jsをインストールした後`npm install`してください。  

### 開発コマンド
開発に利用するコマンドは`package.json`に記載していますが、`npm workspace`を利用しているので、いくつかのファイルに分かれています。  
- root (package.json)
- core (packages/core/package.json)
- web (packages/web/package.json)
- command (packages/command/package.json)

rootでlintを実行する際には`npm run lint`ですが、サブパッケージで開発webサーバを立ち上げる際は、プロジェクト名の指定が必要です。  
```
npm run dev -w @motojouya/kniw-web
```

すべてのコマンドはプロジェクトルートから実行します。  
その他のコマンドについては、npm workspaceの利用方法に則ってください。  

### CI
CIは、以下の4つのジョブがPRの単位で実行されます。すべてのチェックをクリアしないとmergeできません。  
- format
- lint
- test
- build

mergeすると、github pagesを更新するジョブが動きます。  

### プロジェクト
以下の3つに分かれており、buildが独立していますが、webとcommandはcoreに依存しています。  
- core
- web
- command

また、commandは永続化にローカルファイルを利用しますが、webはブラウザのIndexed DBに保存します。  

### 資料
ゲームデザインについては、[ゲームデザイン](/docs/develop/game_design.md)を参照してください。  
細かいゲームシステムやルールについては、[ゲームシステム](/docs/system/game_system.md)を参照してください。  

