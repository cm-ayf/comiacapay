"use client";

import { useSuspenseQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMemo } from "react";
import type { Params } from "../../params";
import GetReceipts from "../GetReceiptsPage.graphql";
import useReceiptsMerged from "../useReceiptsMerged";
import type { CreateReceipt } from "@/generated/schema";

export default function Summary({ params }: { params: Params }) {
  const { data } = useSuspenseQuery(GetReceipts, { variables: params });
  const { receipts } = useReceiptsMerged();
  const total = useTotal(receipts ?? []);
  const counts = useCounts(receipts ?? []);

  if (!receipts) return <CircularProgress />;

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>売上</TableCell>
          <TableCell>
            {total
              .toLocaleString("ja-JP", {
                style: "currency",
                currency: "JPY",
              })
              .replace("￥", "¥")}
          </TableCell>
        </TableRow>
        {data.event.displays.map(({ item }) => (
          <TableRow key={item.id}>
            <TableCell>頒布数：{item.name}</TableCell>
            <TableCell>{counts[item.id] ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function useTotal(receipts: CreateReceipt[]) {
  return useMemo(
    () => receipts.reduce((t, { total }) => t + total, 0),
    [receipts],
  );
}

function useCounts(receipts: CreateReceipt[]) {
  return useMemo(() => {
    const counts: { [itemcode: string]: number } = {};
    for (const receipt of receipts) {
      for (const { itemId, count } of receipt.records) {
        counts[itemId] ??= 0;
        counts[itemId] += count;
      }
    }
    return counts;
  }, [receipts]);
}
