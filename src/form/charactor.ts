import type { Charactor } from "../model/charactor";

import { z } from "zod";

import { createCharactor } from "../model/charactor";
import { EmptyParameter } from "../io/window_dialogue";

export const charactorFormSchema = z.object({
  name: z.string().min(1),
});
export type CharactorForm = z.infer<typeof charactorFormSchema>;

export type ToCharactorForm = (charactor: Charactor) => CharactorForm;
export const toCharactorForm: ToCharactorForm = (charactor) => ({
  name: charactor.name,
});

export type ToCharactor = (charactorForm: CharactorForm) => Charactor | EmptyParameter;
export const toCharactor: ToCharactor = (charactorForm) => {
  const { name } = charactorForm;
  if (!name) {
    return new EmptyParameter("name", `nameがありません`);
  }

  return createCharactor(name);
};
