import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useMemo } from "react";
import { useLoaderData } from "react-router";
import { useDisplays } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import { formatPrice } from "~/lib/price";

export default function Summary() {
  const { displays } = useDisplays();
  const { receipts } = useLoaderData<typeof clientLoader>();

  const total = useMemo(() => {
    return receipts.reduce((total, receipt) => total + receipt.total, 0);
  }, [receipts]);
  const counts = useMemo(() => {
    const counts: { [itemId: string]: number } = {};
    for (const receipt of receipts) {
      for (const { itemId, count } of receipt.records) {
        counts[itemId] ??= 0;
        counts[itemId] += count;
      }
    }
    return counts;
  }, [receipts]);

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell>売上</TableCell>
          <TableCell>{formatPrice(total)}</TableCell>
        </TableRow>
        {displays.map(({ item }) => (
          <TableRow key={item.id}>
            <TableCell>頒布数：{item.name}</TableCell>
            <TableCell>{counts[item.id] ?? 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
