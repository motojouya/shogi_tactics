
# コード整理
コードの整理もしたい。component設計、コードコメント削除、modelの責務整理、テストコードの整理など
ディレクトリごとにメモしていく

## /
- [x] コメント削除

## .github/
- [x] コメント削除

## docs/
- [ ] ファイルの削除はこのPRが終わったら

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
- [ ] コメント削除

## src/guide/
- [ ] コメント削除

## src/model/
- [ ] コメント削除

## src/components/
- [ ] コメント削除

## src/feature/
- [ ] コメント削除

## src/pages/
- [ ] コメント削除

