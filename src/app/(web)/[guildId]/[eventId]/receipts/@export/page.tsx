"use client";

import { useSuspenseQuery } from "@apollo/client";
import LoadingButton from "@mui/lab/LoadingButton";
import { useMemo } from "react";
import type { Params } from "../../params";
import GetReceiptsPageQuery from "../GetReceiptsPage.graphql";
import useReceiptsMerged, { toRow } from "../useReceiptsMerged";

export default function Export({ params }: { params: Params }) {
  const { receipts, loading } = useReceiptsMerged();
  const { data } = useSuspenseQuery(GetReceiptsPageQuery, {
    variables: params,
  });
  const header = useMemo<{ key: string; title: string }[]>(() => {
    return [
      { key: "id", title: "ID" },
      { key: "timestamp", title: "時刻" },
      { key: "total", title: "合計" },
      { key: "pushed", title: "同期" },
      ...data.event.displays.map(({ item }) => ({
        key: item.id,
        title: item.name,
      })),
    ];
  }, [data.event.displays]);

  async function onClick() {
    if (!receipts) return;

    const headerString = header.map(({ title }) => `"${title}"`).join(",");
    const bodyString = receipts
      .map(toRow)
      .map((row) => header.map(({ key }) => row[key as any]).join(","))
      .join("\n");
    const blob = new Blob([headerString + "\n" + bodyString], {
      type: "text/csv; charset=utf-8",
    });

    download(blob, "receipts.csv");
  }

  return (
    <LoadingButton variant="contained" loading={loading} onClick={onClick}>
      CSV
    </LoadingButton>
  );
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  link.remove();
}
