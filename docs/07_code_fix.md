
# コード整理
コードの整理もしたい。component設計、コードコメント削除、modelの責務整理、テストコードの整理など
ディレクトリごとにメモしていく

## /
- [x] コメント削除

## .github/
- [x] コメント削除

## docs/
ファイルの削除はこのPRが終わったら

## public/
- [ ] ディレクトリごとsrcの配下に移動したい
- [ ] public配下の構成が深いので、フラットにしたい

## test/
- [x] コメント削除

## src/data/
- [x] コメント削除
- [ ] Actionに引数を与えている部分だが、statusのkeyなので、data/statusをimportしてその値を入れるべき

## src/repository/
- [x] コメント削除
- [ ] `error.ts`はmodel配下に移動したい
- [ ] importJsonFileの帰り値はgenerics型, exportJsonFileの引数はunknownが来ているが、これらをstringに変更したい。serialize,deserializeはBattleRepository側で行いたい

## src/form/
- [x] コメント削除
- [ ] action.tsのsideLabelで`FIRST`という定数を使っているが、modelの値をimportして利用したい
- [ ] action.unit.test.tsにreceiverSelectOptionのテストがない
- [ ] creation.tsは定数がstringになっているが、modelの値をimportして利用したい
- [ ] creation.tsでformの定義だが、normal/warでそもそも型定義を別にしてunion typeとしたい。normalにはstepBaseとunitCountがない。これは可能ならするが、必要以上にややこしいならしない。

## src/controller/
- [x] コメント削除
- [ ] act.tsでvalidateReceiversを呼び出しているが、これはdoActの内部で呼ばれるべき。actはもう少し短くなるはず
- [ ] act.tsの頭で、UserCancelのダイアログを出すべき。コード量が減る
- [ ] act.unit.test.tsに`doActionForm.actionKey === ORDER_DO_NOTHING`のパターンがない。その場合に、保存できる場合、cancelする場合がある
- [ ] start.tsはcreate.tsと、format.tsに分ける。関数名もそれに準じた形に
- [ ] start.tsから移動したregisterBattleはcreateBattleになる。引数はcreationFormとversionの2つにする。通常モードの場合は、unit登録まで行う。unit登録は、formatBattleで呼び出すformatではなく、別の関数でunitsの引数がいらないものを用意して呼び出す形
- [ ] start.tsから移動したstartBattleはformatBattleになる。battleが編成中でない場合はエラーとする。また、呼び出しているcopyBattle,start関数は一つのまとまりとして、format関数としてmodelに定義する。
- [ ] surrender.tsはcopyBattle,surrender,決着の記録はmodelがわの一つの関数にまとまっているべき
- [ ] surrender.tsのactionDateはrepositoryから取得できるので、引数には受け付けない

## src/guide/
- [x] コメント削除

## src/pages/
- [x] コメント削除
- [ ] `guide/*`配下にindex.tsxを配置し、そこでpathを引数として渡す形を取る。stringが""ならばguideとすればいい。
- [ ] guide/app.tsxのguideEntries,GuideIndexはfeatureに移動する
- [ ] guide/app.tsxのNotFoundはcomponent/utility.tsxに移動して共通化
- [ ] guide/piece/app.tsxはもしかしたら戦闘中画面と共通化できるかもだが、要検討
- [ ] list/app.tsxで対戦中/編成中の判定ロジックはmodel側に持ちたい
- [ ] list/app.tsxのonDeleteはcontrollerに移動
- [ ] list/app.tsxのuseLiveQueryにわたすcallbackもcontrollerに移動する
- [ ] v1/app.tsxにも編成中の判定ロジックがあるので、modelに
- [ ] v1/app.tsxでlocal変数を使っているが、Contextに存在するので、Contextのコンポーネント内部に移動して、そこのlocalを使う

## src/feature/
- [ ] コメント削除

## src/components/
- [ ] コメント削除
- [ ] markdown.tsxのMarkdownPageはfeatureに移動

## src/model/
未レビュー

## その他
faviconの用意。将棋の駒だが、中は漢字ではなく十字になっているというものにするか。これなら簡単だ

