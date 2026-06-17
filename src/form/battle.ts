import type { UnitReference } from "../model/unit";
import type { DoActionInput } from "../model/battle";
import type { SelectOption } from "../repository/utility";

import { z } from "zod";

import { DataNotFoundError } from "../repository/error";
import { selectUnit } from "../model/unit";
import { actionRepository } from "../repository/action";
import { pieceRepository } from "../repository/piece";
import { ORDER_DO_NOTHING } from "../model/turn";

// 何もしないを表すフォーム値(actionKeyとして使用)
export const DO_NOTHING = ORDER_DO_NOTHING;

export class ReceiverDuplicationError {
  readonly message: string;
  constructor(message: string) {
    this.message = message;
  }
}

export const doActionFormSchema = z.object({
  actionKey: z.string().min(1),
  receivers: z.array(z.object({ value: z.string().min(1).optional() }).optional()),
});
export type DoActionForm = z.infer<typeof doActionFormSchema>;

const sideLabel = (reference: UnitReference): string => (reference.side === "FIRST" ? "先" : "後");

// UnitReferenceを受け手選択肢に変換する。value形式は `${side}:${piece}` (model/unit.selectUnit互換)。
export type ReceiverSelectOption = (reference: UnitReference) => SelectOption;
export const receiverSelectOption: ReceiverSelectOption = (reference) => {
  const piece = pieceRepository.get(reference.piece);
  return {
    value: `${reference.side}:${reference.piece}`,
    label: `${sideLabel(reference)}:${piece ? piece.name : reference.piece}`,
  };
};

// フォーム値(actionKey + receivers)をspendTurnのDoActionInputへ変換する。
// 何もしない=null。actionKey不正=DataNotFoundError。受け手重複=ReceiverDuplicationError。
export type ToAction = (form: DoActionForm) => DoActionInput | null | DataNotFoundError | ReceiverDuplicationError;
export const toAction: ToAction = (form) => {
  const { actionKey } = form;
  if (actionKey === DO_NOTHING) {
    return null;
  }

  const action = actionRepository.get(actionKey);
  if (!action) {
    return new DataNotFoundError(actionKey, "action", `${actionKey}というactionは存在しません`);
  }

  const receiverValues = form.receivers
    .filter((receiver) => !!receiver)
    .map((receiver) => receiver.value)
    .filter((value): value is string => !!value);

  if (new Set(receiverValues).size !== receiverValues.length) {
    return new ReceiverDuplicationError("同じunitを複数回えらべません");
  }

  const receivers: UnitReference[] = receiverValues.map(selectUnit);

  return {
    action,
    receivers,
  };
};
