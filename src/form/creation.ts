import { z } from "zod";

// step15(S14/§3.2 → 実利用化): battle作成フォームのzod schema。手書きバリデーションの唯一の置き換え先。
// stepBase/unitCountはnumber。画面側はTextField type=number + register({valueAsNumber:true})で数値として受け、
// 既定値は通常モードの値(stepBase=14, unitCount=7)を入れる(通常モードでは入力欄を出さずこの既定値を使う)。
// モードで必須が変わる(通常: player名のみ実質必須 / 戦乱: stepBase/unitCountも1以上)ためsuperRefineで条件付き検証する。
export const creationFormSchema = z
  .object({
    mode: z.enum(["normal", "war"]),
    first_player_name: z.string().min(1, "先手のプレイヤー名を入力してください"),
    second_player_name: z.string().min(1, "後手のプレイヤー名を入力してください"),
    stepBase: z.number({ error: "stepBaseは1以上の数値を入力してください" }),
    unitCount: z.number({ error: "unitCountは1以上の数値を入力してください" }),
  })
  .superRefine((value, ctx) => {
    // 戦乱モードのみstepBase/unitCountを検証する(通常モードは固定の既定値を使うため検証不要)。
    if (value.mode !== "war") {
      return;
    }
    if (!Number.isInteger(value.stepBase) || value.stepBase < 1) {
      ctx.addIssue({ code: "custom", path: ["stepBase"], message: "stepBaseは1以上の数値を入力してください" });
    }
    if (!Number.isInteger(value.unitCount) || value.unitCount < 1) {
      ctx.addIssue({ code: "custom", path: ["unitCount"], message: "unitCountは1以上の数値を入力してください" });
    }
  });
export type CreationForm = z.infer<typeof creationFormSchema>;
