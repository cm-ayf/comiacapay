"use client";

import { useSuspenseQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useParams } from "next/navigation";
import { use, useMemo } from "react";
import type { Params } from "../../params";
import GetReceipts from "../GetReceiptsPage.graphql";
import { ReceiptsPage } from "../ReceiptsPage";
import useReceiptsMerged, { toRow } from "../useReceiptsMerged";

export default function Table({ params }: { params: Params }) {
  const columns = useColumns();
  const { data } = useSuspenseQuery(GetReceipts, { variables: params });
  const { receipts } = useReceiptsMerged();
  const { selected, setSelected } = use(ReceiptsPage);

  if (!receipts) return <CircularProgress />;

  return (
    <DataGrid
      rows={receipts.map(toRow)}
      columns={columns}
      checkboxSelection={data.event.guild.me.register}
      getRowId={(row) => row.id}
      rowSelectionModel={selected}
      onRowSelectionModelChange={(selected) =>
        setSelected(selected.map(String))
      }
      sx={{ height: "100%" }}
    />
  );
}

function useColumns() {
  const params = useParams<Params>();
  const { data } = useSuspenseQuery(GetReceipts, { variables: params });

  return useMemo<GridColDef[]>(
    () => [
      {
        field: "timestamp",
        headerName: "時刻",
        width: 160,
        valueGetter: ({ value }) => new Date(value).toLocaleString("ja-JP"),
      },
      { field: "total", headerName: "合計", width: 90, align: "right" },
      { field: "pushed", headerName: "同期", width: 90, align: "center" },
      ...data.event.displays.map<GridColDef>(({ item }) => ({
        field: item.id,
        headerName: item.name,
        width: 160,
        align: "right",
      })),
    ],
    [data.event.displays],
  );
}
