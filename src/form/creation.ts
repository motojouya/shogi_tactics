import { z } from "zod";

// step15(S14/§3.2): pages/new の手書きバリデーション(player名必須・stepBase/unitCount≥1)をzod schemaへ。
// battle作成フォーム。通常モード/戦乱モードで必須項目が異なるため2種を用意する。適用(react-hook-formへの接続)はPhase 7。

// player名は両モード共通で必須。
const playerNameFields = {
  first_player_name: z.string().min(1, "先手のプレイヤー名を入力してください"),
  second_player_name: z.string().min(1, "後手のプレイヤー名を入力してください"),
};

// 通常モード: player名のみ。stepBase/unitCountはNORMAL_STEP_BASE/NORMAL_UNIT_COUNTの固定定数を使う。
export const normalCreationFormSchema = z.object({
  ...playerNameFields,
});
export type NormalCreationForm = z.infer<typeof normalCreationFormSchema>;

// 戦乱モード: stepBase/unitCountも入力。TextFieldのstring入力をcoerceで数値化し、1以上の整数を要求する。
// 空文字""はNumber("")=0でmin(1)失敗、非数値はNaNでmin(1)失敗となり、いずれも入力を促すメッセージになる。
export const warCreationFormSchema = z.object({
  ...playerNameFields,
  stepBase: z.coerce.number().int().min(1, "stepBaseは1以上の数値を入力してください"),
  unitCount: z.coerce.number().int().min(1, "unitCountは1以上の数値を入力してください"),
});
export type WarCreationForm = z.infer<typeof warCreationFormSchema>;
