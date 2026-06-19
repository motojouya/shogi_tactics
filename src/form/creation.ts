import { z } from "zod";

// step15(S14/§3.2 → 実利用化): battle作成フォームのzod schema。手書きバリデーションの唯一の置き換え先。
// モードで必須項目が異なる(通常: player名のみ / 戦乱: stepBase/unitCountも1以上)ため、modeをフォーム値に含め
// superRefineで条件付き検証する。TextFieldの入力はstringなのでstepBase/unitCountはstringのまま受け、利用側でNumber化する。
export const creationFormSchema = z
  .object({
    mode: z.enum(["normal", "war"]),
    first_player_name: z.string().min(1, "先手のプレイヤー名を入力してください"),
    second_player_name: z.string().min(1, "後手のプレイヤー名を入力してください"),
    stepBase: z.string().optional(),
    unitCount: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    // 戦乱モードのみstepBase/unitCountを検証する(通常モードは固定定数を使うため未入力でよい)。
    if (value.mode !== "war") {
      return;
    }
    const stepBase = Number(value.stepBase);
    if (!value.stepBase || Number.isNaN(stepBase) || stepBase < 1) {
      ctx.addIssue({ code: "custom", path: ["stepBase"], message: "stepBaseは1以上の数値を入力してください" });
    }
    const unitCount = Number(value.unitCount);
    if (!value.unitCount || Number.isNaN(unitCount) || unitCount < 1) {
      ctx.addIssue({ code: "custom", path: ["unitCount"], message: "unitCountは1以上の数値を入力してください" });
    }
  });
export type CreationForm = z.infer<typeof creationFormSchema>;
