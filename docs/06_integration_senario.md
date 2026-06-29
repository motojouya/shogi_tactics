
# Integration Senario

1. 通常モード
  - トップ画面で`対戦を作る`
  - 通常モードで対戦を作成
  - 対戦画面で先手の降参
  - 対戦画面で後手の勝利と表示されている
  - リスト画面で後手の処理の対戦が表示されている
2. 戦乱モード
  - リスト画面で`新しく作る`
  - 戦乱モードで対戦を作成。ユニット数は3で基礎コスト7とする。
  - 編成画面の表示
  - リスト画面に戻ると、対象の対戦が編成中と表示される
  - 再び対戦を選択すると編成画面が表示される
  - 編成を完了させる
  - 対戦中画面の表示
  - リスト画面に戻ると、対象の対戦が対戦中と表示される
  - 再び対戦を選択すると対戦中画面が表示される
  - ターン経過させ、後手の勝利となる
  - 対戦中画面では、後手の勝利と表示される
  - リスト画面に戻ると、対象の対戦が後手の勝利と表示される
3. 削除
  - リスト臥煙で、通常モードで作った対戦を削除する
  - リストには1件だけ表示されている

## 実装メモ（Playwright統合テスト）

- **テスト**: `test/integration.spec.ts`。上記3シナリオを1つのtest内のtest.stepで順に実行する（IndexedDB(Dexie)の状態をシナリオ間で共有するため）。
- **設定**: `playwright.config.ts`（dev server `npm run dev` を自動起動 / port3000 / testDir=test / `*.spec.ts`）。実行は `npm run e2e`。
- **vitestとの分離**: `vite.config.ts` の `test.include` を `src/**/*.unit.test.ts` のみにし、`test/`配下のPlaywright specをvitestが拾わないようにした。
- **シナリオ成立のためのアプリ変更**:
  - `pages/list/app.tsx`: リストの状態表示に「編成中」(`turns.length===0`)と「対戦中」の区別を追加（手順2-14が要求）。
  - `feature/action.tsx`: 行動主サイドのChipに `data-testid="actor-side"`（手番判定用）。
  - `feature/formation.tsx`: 駒選択TextFieldに `id="formation_piece"`。
- **戦乱モードの勝利の作り方**: 先手リーダー=将軍(MaxHP2)、後手に攻撃手(軽弓=遠隔/薬師=近接)を配置。先手手番は「何もしない」、後手手番は先手の将軍を攻撃する、を繰り返すと先手リーダー陥落で後手勝利になる。
- **実行環境(重要)**: ブラウザ本体(`~/.cache/ms-playwright`)とnode_modulesはhome配下で永続。OSの共有ライブラリ(aptパッケージ)のみ揮発領域に入るため、起動毎に `sudo npx playwright install-deps chromium`(またはstartup script)で再インストールが必要。

