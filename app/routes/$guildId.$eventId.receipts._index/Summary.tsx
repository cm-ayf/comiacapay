import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { useDisplays, useEvent } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import { useAlert } from "~/components/Alert";
import { Snowflake } from "~/lib/snowflake";

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

  useFunding();

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

function useFunding() {
  const { info } = useAlert();
  const event = useEvent();
  const { receipts } = useLoaderData<typeof clientLoader>();
  const [now] = useState(() => Date.now());

  const shouldShowFunding = useMemo(() => {
    if (receipts.length < 20) return false;

    const eventAt = event.date.getTime();
    const isRecentEvent =
      eventAt <= now && now < eventAt + 3 * 24 * 60 * 60 * 1000;
    if (!isRecentEvent) return false;

    const lastReceipt = receipts.at(-1)!;
    const snowflake = Snowflake.parse(lastReceipt.id);
    if (!snowflake) return false;
    const didEventEnd = snowflake.timestamp + 0 * 60 * 60 * 1000 < now;
    if (!didEventEnd) return false;

    return true;
  }, [event, now, receipts]);

  useEffect(() => {
    const didShowFundingAt = localStorage.getItem("didShowFundingAt");
    const didShowFundingAtTime = didShowFundingAt
      ? parseInt(didShowFundingAt)
      : 0;
    if (shouldShowFunding && didShowFundingAtTime + 24 * 60 * 60 * 1000 < now) {
      localStorage.setItem("didShowFundingAt", now.toString());
      info(
        <>
          もしよろしければ、
          <a href="https://github.com/sponsors/cm-ayf?frequency=one-time">
            GitHub Sponsor
          </a>
          にお布施をお願いします！
        </>,
      );
    }
  }, [info, now, shouldShowFunding]);
}
