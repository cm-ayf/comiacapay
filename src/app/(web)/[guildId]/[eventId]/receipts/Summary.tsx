import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMemo } from "react";
import useReceiptExts, { ReceiptExt } from "./useReceiptExts";
import { useEvent } from "@/hooks/swr";

export default function Summary({ eventcode }: { eventcode: string }) {
  const { data: event } = useEvent({ eventcode });
  const { receipts } = useReceiptExts(eventcode);
  const total = useTotal(receipts ?? []);
  const counts = useCounts(receipts ?? []);

  if (!event || !receipts) return <CircularProgress />;

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
        {event?.items.map(({ code, name }) => (
          <TableRow key={code}>
            <TableCell>頒布数：{name}</TableCell>
            <TableCell>{counts[code] ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function useTotal(receipts: ReceiptExt[]) {
  return useMemo(
    () => receipts.reduce((t, { total }) => t + total, 0),
    [receipts],
  );
}

function useCounts(receipts: ReceiptExt[]) {
  return useMemo(() => {
    const counts: { [itemcode: string]: number } = {};
    for (const receipt of receipts) {
      for (const { itemcode, count } of receipt.records) {
        counts[itemcode] = (counts[itemcode] ?? 0) + count;
      }
    }
    return counts;
  }, [receipts]);
}
