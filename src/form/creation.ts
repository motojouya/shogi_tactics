import { z } from "zod";

import { modeSchema, WAR_MODE } from "../model/battle";

export const creationFormSchema = z
  .object({
    mode: modeSchema,
    first_player_name: z.string().min(1, "先手のプレイヤー名を入力してください"),
    second_player_name: z.string().min(1, "後手のプレイヤー名を入力してください"),
    stepBase: z.number({ error: "stepBaseは1以上の数値を入力してください" }),
    unitCount: z.number({ error: "unitCountは1以上の数値を入力してください" }),
  })
  .superRefine((value, ctx) => {
    // 戦乱モードのみstepBase/unitCountを検証する(通常モードは固定の既定値を使うため検証不要)。
    if (value.mode !== WAR_MODE) {
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
