import type { Side } from "../model/unit";

export const sideLabel = (side: Side): string => (side === "FIRST" ? "先手" : "後手");
