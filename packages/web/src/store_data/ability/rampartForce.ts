import type { Ability } from "../../model/ability";
import { justWait } from "../../model/ability";

export const rampartForce: Ability = {
  name: "rampartForce",
  label: "ランパートフォース",
  wait: justWait,
  description: "隣を通る際に一旦停止する",
};
