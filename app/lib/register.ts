import { useCallback, useSyncExternalStore } from "react";
import type { InferInput } from "valibot";
import type { ClientDisplay, ClientEvent, CreateRecord } from "./schema";
import { Snowflake } from "./snowflake";

export interface RecordSnapshot {
  count: number;
  internal: boolean;
  dedication: boolean;
}

const DEFAULT_SNAPSHOT: RecordSnapshot = {
  count: 0,
  internal: false,
  dedication: false,
};

let total = 0;
const state = new Map<string, RecordSnapshot>();
const listeners = new Set<() => void>();

type CalculateInput = Pick<ClientEvent, "discounts"> & {
  displays: Omit<ClientDisplay, "item">[];
};

function calculate(event: CalculateInput) {
  const price = event.displays.reduce((acc, display) => {
    const record = state.get(display.itemId);
    if (!record) return acc;

    if (record.dedication) return acc;
    else if (display.internalPrice !== null && record.internal)
      return acc + display.internalPrice * record.count;
    else return acc + display.price * record.count;
  }, 0);

  const discount = event.discounts.reduce((acc, discount): number => {
    switch (discount.__typename) {
      case "SetDiscount": {
        const setCount = discount.itemIds.reduce((acc, itemId) => {
          const record = state.get(itemId);
          if (!record || record.dedication || record.internal) return 0;
          return Math.min(acc, record.count);
        }, Infinity);
        return acc + setCount * discount.amount;
      }
    }
  }, 0);

  total = price - discount;
}

type CreateRecordInput = InferInput<typeof CreateRecord>;
export function getCreateReceiptInput() {
  const id = Snowflake.generate().toString();
  const records = Array.from(
    state.entries(),
    ([itemId, snapshot]): CreateRecordInput => ({ itemId, ...snapshot }),
  );
  return { id, total, records };
}

export function clearRecords() {
  total = 0;
  state.clear();
  listeners.forEach((listener) => listener());
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function useRecordSnapshot(event: CalculateInput, itemId: string) {
  const record = useSyncExternalStore(
    subscribe,
    () => state.get(itemId) ?? DEFAULT_SNAPSHOT,
    () => DEFAULT_SNAPSHOT,
  );

  const setRecord = useCallback(
    (
      patch:
        | Partial<RecordSnapshot>
        | ((prevState: RecordSnapshot) => Partial<RecordSnapshot>),
    ) => {
      const prevState = state.get(itemId) ?? DEFAULT_SNAPSHOT;
      if (typeof patch === "function") patch = patch(prevState);
      const nextState = { ...prevState, ...patch };

      if (nextState.count === 0) state.delete(itemId);
      else state.set(itemId, nextState);

      calculate(event);
      listeners.forEach((listener) => listener());
    },
    [event, itemId],
  );

  return [record, setRecord] as const;
}

export function useTotal() {
  return useSyncExternalStore<number>(
    subscribe,
    () => total,
    () => 0,
  );
}

export function useHasSomeRecord() {
  return useSyncExternalStore<boolean>(
    subscribe,
    () => state.size > 0,
    () => false,
  );
}
