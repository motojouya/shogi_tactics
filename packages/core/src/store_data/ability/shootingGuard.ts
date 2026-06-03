import type { Ability } from "../../model/ability";
import { justWait } from "../../model/ability";

export const shootingGuard: Ability = {
  name: "shootingGuard",
  label: "矢かわし",
  wait: justWait,
  description: "弓矢の攻撃を受けない",
};
