import { test, expect, type Page, type Locator } from "@playwright/test";

const NORMAL = { first: "ノーマル先", second: "ノーマル後" };
const WAR = { first: "戦乱先", second: "戦乱後" };

const selectOption = async (page: Page, combo: Locator, optionName: string): Promise<void> => {
  await combo.click();
  await page.getByRole("option", { name: optionName, exact: true }).click();
};

const modeSelect = (page: Page): Locator => page.getByRole("combobox", { name: "モード" });
const actionSelect = (page: Page): Locator => page.getByRole("combobox", { name: "行動" });
const receiverSelect = (page: Page): Locator => page.getByRole("combobox", { name: "対象" });

test("docs/06 シナリオ: 通常モード(降参) / 戦乱モード(対戦して勝敗) / 削除", async ({ page }) => {
  // 降参・実行・削除の確認ダイアログはすべて承認する。
  page.on("dialog", (dialog) => dialog.accept());

  await test.step("1. 通常モード: 作成→先手降参→後手勝利→リスト表示", async () => {
    await page.goto("/");
    await page.getByRole("link", { name: "対戦を作る" }).click();

    // 作成画面(通常モードが既定)。プレイヤー名を入力して対戦開始。
    await expect(modeSelect(page)).toBeVisible();
    await page.locator("#first_player_name").fill(NORMAL.first);
    await page.locator("#second_player_name").fill(NORMAL.second);
    await page.getByRole("button", { name: "対戦開始" }).click();

    // 対戦画面に遷移。先手のターンから先手が降参する。
    await expect(page.getByTestId("actor-side")).toHaveText("先手");
    await page.getByRole("button", { name: "降参" }).click();

    // 後手の勝利が対戦画面に表示される。
    await expect(page.getByText(/後手の勝利/)).toBeVisible();

    // リスト画面に後手(プレイヤー名)の勝利として表示される。
    await page.goto("/list/");
    await expect(page.getByText(`${NORMAL.second} の勝利`)).toBeVisible();
  });

  await test.step("2. 戦乱モード: 作成→編成→対戦→後手勝利。リスト表示は編成中→対戦中→勝利と変化", async () => {
    // リスト画面から新しく作る。
    await page.getByRole("link", { name: "新しく作る" }).click();

    // 戦乱モードで駒数3・基礎コスト7を入力。
    await expect(modeSelect(page)).toBeVisible();
    await selectOption(page, modeSelect(page), "戦乱モード(駒数自由)");
    await page.locator("#first_player_name").fill(WAR.first);
    await page.locator("#second_player_name").fill(WAR.second);
    await page.locator("#unitCount").fill("3");
    await page.locator("#stepBase").fill("7");
    await page.getByRole("button", { name: "駒の選択" }).click();

    // 編成画面が表示される。
    await expect(page.getByText(/の編成/)).toBeVisible();

    // リストに戻ると、対象の対戦が編成中と表示される。
    await page.goto("/list/");
    const warRowText = new RegExp(`${WAR.first} vs ${WAR.second}`);
    await expect(page.getByText("編成中")).toBeVisible();

    // 再び対戦を選択すると編成画面が表示される。
    await page.getByRole("link", { name: warRowText }).click();
    await expect(page.getByText(/の編成/)).toBeVisible();

    // 編成を完了させる(先手3駒・後手3駒、各リーダー1体)。
    // 追加は先手→後手の交互。後手の軽弓/薬師は攻撃手として後で先手の将軍を倒す。
    const pieceSelect = page.getByRole("combobox"); // 編成フォームのcomboboxは1つ
    // 追加ボタンは通常「この駒を追加」、最後の1枠だけ「この駒を選んで対戦開始」になるため部分一致で拾う。
    const addUnit = async (pieceName: string, asLeader: boolean) => {
      await selectOption(page, pieceSelect, pieceName);
      if (asLeader) {
        await page.getByRole("checkbox").check();
      }
      await page.getByRole("button", { name: "この駒" }).click();
    };
    await addUnit("将軍（王将）", true); // 先手1: リーダー
    await addUnit("軽弓（飛車）", true); // 後手1: リーダー(遠隔攻撃)
    await addUnit("重装兵（金将）", false); // 先手2
    await addUnit("薬師（歩兵）", false); // 後手2(近接攻撃)
    await addUnit("強弓（角行）", false); // 先手3
    // 後手3(最後の駒)。追加した時点でrosterが揃い、そのまま対戦画面へ自動遷移する。
    await addUnit("野伏（銀将）", false); // 後手3

    // 対戦中画面の表示(行動主のサイドバッヂが出る)。
    await expect(page.getByTestId("actor-side")).toBeVisible();

    // リストに戻ると対戦中と表示される。
    await page.goto("/list/");
    await expect(page.getByText("対戦中")).toBeVisible();

    // 再び対戦を選択すると対戦中画面が表示される。
    await page.getByRole("link", { name: warRowText }).click();
    await expect(page.getByTestId("actor-side")).toBeVisible();

    // 1手戻す: 先手が「何もしない」を実行した後に取り消すと、先手のターンに戻る。
    await expect(page.getByTestId("actor-side")).toHaveText("先手");
    await selectOption(page, actionSelect(page), "何もしない");
    await page.getByRole("button", { name: "実行" }).click();
    await expect(page.getByTestId("actor-side")).toHaveText("後手");
    await page.getByRole("button", { name: "1手戻す" }).click();
    await expect(page.getByTestId("actor-side")).toHaveText("先手");

    // ターンを経過させ、後手の攻撃で先手の将軍(リーダー)を倒す。
    // 先手のターンは何もしない、後手のターンは先手の将軍を攻撃する。
    for (let i = 0; i < 12; i++) {
      let side: string | null;
      try {
        side = await page.getByTestId("actor-side").textContent({ timeout: 4000 });
      } catch {
        break; // 勝敗が決し、行動主表示が消えた
      }
      if (side?.includes("先")) {
        await selectOption(page, actionSelect(page), "何もしない");
      } else {
        // 後手: 攻撃行動(近接/遠隔)を選び、先手の将軍を対象にする。
        await actionSelect(page).click();
        const melee = page.getByRole("option", { name: "近接攻撃（コスト2）", exact: true });
        if (await melee.count()) {
          await melee.click();
        } else {
          await page.getByRole("option", { name: "遠隔攻撃（コスト2）", exact: true }).click();
        }
        await selectOption(page, receiverSelect(page), "先:将軍（王将）");
      }
      await page.getByRole("button", { name: "実行" }).click();
      // 保存→liveQuery反映→再レンダリングを待つ。不足すると古いbattle表示のまま次の手を打つレースになる
      await page.waitForTimeout(1000);
    }

    // 対戦中画面に後手の勝利が表示される。
    await expect(page.getByText(/後手の勝利/)).toBeVisible();

    // リストに戻ると、対象の対戦が後手(プレイヤー名)の勝利と表示される。
    await page.goto("/list/");
    await expect(page.getByText(`${WAR.second} の勝利`)).toBeVisible();
  });

  await test.step("3. 削除: 通常モードの対戦を削除し、リストには戦乱モードの1件だけ残る", async () => {
    // 通常モードで作った対戦の行の削除ボタンを押す。
    const normalRow = page.locator("li", { hasText: `${NORMAL.first} vs ${NORMAL.second}` });
    await normalRow.getByRole("button", { name: "削除" }).click();

    // リストには戦乱モードの1件だけが残る。
    await expect(page.getByText(`${NORMAL.first} vs ${NORMAL.second}`)).toHaveCount(0);
    await expect(page.getByText(`${WAR.first} vs ${WAR.second}`)).toBeVisible();
    await expect(page.getByRole("listitem")).toHaveCount(1);
  });
});
