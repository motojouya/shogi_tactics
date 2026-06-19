import type { Side } from "../model/unit";

// step15(S18/§4.1): 通常形(先手/後手)のside表示ラベル。battle.tsx/formation.tsxで重複していたのを共通化。
// 短縮形(先/後)はreceiver select option専用でform/action.ts側に置く(表示文脈が異なるため統合しない)。
export const sideLabel = (side: Side): string => (side === "FIRST" ? "先手" : "後手");
