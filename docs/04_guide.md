
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

