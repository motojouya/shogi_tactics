import type { Side, UnitReference } from "../model/unit";
import type { Action } from "../model/action";
import type { SelectOption } from "../repository/utility";
import type { Repository } from "../repository";

import { z } from "zod";

import { FIRST } from "../model/unit";
import { ORDER_DO_NOTHING } from "../model/turn";

export const doActionFormSchema = z.object({
  actionKey: z.string().min(1),
  receivers: z.array(z.object({ value: z.string().optional() }).optional()),
});
export type DoActionForm = z.infer<typeof doActionFormSchema>;

export type SelectUnit = (value: string) => UnitReference;
export const selectUnit: SelectUnit = (value) => {
  const index = value.indexOf(":");
  const side = value.slice(0, index) as Side;
  const piece = value.slice(index + 1);
  return { side, piece };
};

const sideLabel = (reference: UnitReference): string => (reference.side === FIRST ? "先" : "後");

export type ReceiverSelectOption = (pieceRepository: Repository["piece"]) => (reference: UnitReference) => SelectOption;
export const receiverSelectOption: ReceiverSelectOption = (pieceRepository) => (reference) => {
  const piece = pieceRepository.get(reference.piece);
  return {
    value: `${reference.side}:${reference.piece}`,
    label: `${sideLabel(reference)}:${piece ? piece.name : reference.piece}`,
  };
};

export type ActionSelectOptions = (actions: Action[]) => SelectOption[];
export const actionSelectOptions: ActionSelectOptions = (actions) => [
  ...actions.map((action) => ({ value: action.key, label: `${action.name}（コスト${action.cost}）` })),
  { value: ORDER_DO_NOTHING, label: "何もしない" },
];

export type ToReceivers = (receivers: DoActionForm["receivers"]) => UnitReference[];
export const toReceivers: ToReceivers = (receivers) =>
  receivers
    .filter((receiver) => !!receiver)
    .map((receiver) => receiver.value)
    .filter((value): value is string => !!value)
    .map(selectUnit);
