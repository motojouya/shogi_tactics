import { z } from "zod";

import {
  modeSchema,
  WAR_MODE,
  NORMAL_MODE,
  NORMAL_STEP_BASE,
  NORMAL_UNIT_COUNT,
  MAX_PLAYER_NAME_LENGTH,
  MIN_STEP_BASE,
  MAX_STEP_BASE,
  MIN_UNIT_COUNT,
  MAX_UNIT_COUNT,
} from "../model/battle";

export const creationFormSchema = z
  .object({
    mode: modeSchema,
    first_player_name: z
      .string()
      .min(1, "先手のプレイヤー名を入力してください")
      .max(MAX_PLAYER_NAME_LENGTH, `先手のプレイヤー名は${MAX_PLAYER_NAME_LENGTH}文字以下で入力してください`),
    second_player_name: z
      .string()
      .min(1, "後手のプレイヤー名を入力してください")
      .max(MAX_PLAYER_NAME_LENGTH, `後手のプレイヤー名は${MAX_PLAYER_NAME_LENGTH}文字以下で入力してください`),
    stepBase: z.number({ error: `stepBaseは${MIN_STEP_BASE}から${MAX_STEP_BASE}の数値を入力してください` }),
    unitCount: z.number({ error: `unitCountは${MIN_UNIT_COUNT}から${MAX_UNIT_COUNT}の数値を入力してください` }),
  })
  .superRefine((value, ctx) => {
    // 戦乱モードのみstepBase/unitCountを検証する(通常モードは固定の既定値を使うため検証不要)。
    if (value.mode !== WAR_MODE) {
      return;
    }
    if (!Number.isInteger(value.stepBase) || value.stepBase < MIN_STEP_BASE || value.stepBase > MAX_STEP_BASE) {
      ctx.addIssue({
        code: "custom",
        path: ["stepBase"],
        message: `stepBaseは${MIN_STEP_BASE}から${MAX_STEP_BASE}の整数を入力してください`,
      });
    }
    if (!Number.isInteger(value.unitCount) || value.unitCount < MIN_UNIT_COUNT || value.unitCount > MAX_UNIT_COUNT) {
      ctx.addIssue({
        code: "custom",
        path: ["unitCount"],
        message: `unitCountは${MIN_UNIT_COUNT}から${MAX_UNIT_COUNT}の整数を入力してください`,
      });
    }
  });
export type CreationForm = z.infer<typeof creationFormSchema>;

export const creationFormDefault: CreationForm = {
  mode: NORMAL_MODE,
  first_player_name: "",
  second_player_name: "",
  stepBase: NORMAL_STEP_BASE,
  unitCount: NORMAL_UNIT_COUNT,
};
