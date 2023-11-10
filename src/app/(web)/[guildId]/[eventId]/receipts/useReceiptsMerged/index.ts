"use client";

import { useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { useReceipts } from "../../idb";
import type { Params } from "../../params";
import GetReceipts from "./GetReceipts.graphql";
import type { CreateReceipt } from "@/generated/schema";
import { parseSnowflake } from "@/shared/snowflake";

export default function useReceiptsMerged() {
  const params = useParams<Params>();
  const {
    data,
    refetch,
    loading: serverLoading,
  } = useQuery(GetReceipts, {
    variables: params,
    pollInterval: 5000,
  });

  const serverReceipts = data?.event.receipts;
  const { receipts: idbReceipts, loading: idbLoading } = useReceipts();

  return {
    receipts: useMemo(() => {
      if (!serverReceipts) return;
      if (!idbReceipts) return;

      const receiptsById = new Map<string, CreateReceipt & { pushed: boolean }>(
        idbReceipts
          .filter(({ pushed }) => !pushed)
          .map((receipt) => [receipt.id, receipt]),
      );
      for (const receipt of serverReceipts) {
        receiptsById.set(receipt.id, { ...receipt, pushed: true });
      }

      return Array.from(receiptsById.values());
    }, [serverReceipts, idbReceipts]),
    refetch,
    loading: serverLoading || idbLoading,
  };
}

export function toRow({
  records,
  ...rest
}: CreateReceipt & { pushed: boolean }): {
  id: string;
  timestamp: number;
  total: number;
  pushed: boolean;
  [itemId: `${bigint}`]: number;
} {
  const { timestamp } = parseSnowflake(rest.id);
  return {
    ...rest,
    timestamp,
    ...Object.fromEntries(records.map(({ itemId, count }) => [itemId, count])),
  };
}
