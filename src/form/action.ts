import type { Side, UnitReference } from "../model/unit";
import type { SelectOption } from "../repository/utility";
import type { Repository } from "../repository";

import { z } from "zod";

// 「何もしない」のactionKey sentinelは model/turn の ORDER_DO_NOTHING を単一の真実とする(S15/§4.4で間接re-exportを廃止)。

export const doActionFormSchema = z.object({
  actionKey: z.string().min(1),
  receivers: z.array(z.object({ value: z.string().min(1).optional() }).optional()),
});
export type DoActionForm = z.infer<typeof doActionFormSchema>;

// step15(S13/§7.1e): `${side}:${piece}` 形式のフォーム値文字列からUnitReferenceを復元する(model→form移設)。
// 値(string)の解釈はform層の責務。formはmodelの型を知ってよい(逆は不可)。
export type SelectUnit = (value: string) => UnitReference;
export const selectUnit: SelectUnit = (value) => {
  const index = value.indexOf(":");
  const side = value.slice(0, index) as Side;
  const piece = value.slice(index + 1);
  return { side, piece };
};

const sideLabel = (reference: UnitReference): string => (reference.side === "FIRST" ? "先" : "後");

// UnitReferenceを受け手選択肢に変換する。value形式は `${side}:${piece}` (selectUnit互換)。
// piece repositoryはDIで受け取る(直接importしない)。
export type ReceiverSelectOption = (pieceRepository: Repository["piece"]) => (reference: UnitReference) => SelectOption;
export const receiverSelectOption: ReceiverSelectOption = (pieceRepository) => (reference) => {
  const piece = pieceRepository.get(reference.piece);
  return {
    value: `${reference.side}:${reference.piece}`,
    label: `${sideLabel(reference)}:${piece ? piece.name : reference.piece}`,
  };
};

// step15(S13/§7.2b): toActionは解体した。formの責務は受け手フォーム値(`${side}:${piece}`の配列)を
// UnitReference[]へ解決することのみ。actionKeyはmodelがそのまま受け取れる値なので関数で包まず、controllerが直接渡す。
// action解決(repository経由)・受け手重複検証(model)はform外の責務。
export type ToReceivers = (receivers: DoActionForm["receivers"]) => UnitReference[];
export const toReceivers: ToReceivers = (receivers) =>
  receivers
    .filter((receiver) => !!receiver)
    .map((receiver) => receiver.value)
    .filter((value): value is string => !!value)
    .map(selectUnit);
