import { DataGrid, GridToolbar, type GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { useMember } from "../$guildId";
import { useDisplays } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import type { IDBReceipt } from "~/lib/idb.client";
import { Snowflake } from "~/lib/snowflake";

export default function Table({
  selected,
  setSelected,
}: {
  selected: string[];
  setSelected: (ids: string[]) => void;
}) {
  const { displays } = useDisplays();
  const columns = useMemo<GridColDef[]>(
    () => [
      {
        field: "timestamp",
        headerName: "時刻",
        type: "dateTime",
        width: 160,
      },
      {
        field: "total",
        headerName: "合計",
        type: "number",
        width: 90,
        align: "right",
      },
      {
        field: "pushed",
        headerName: "同期",
        type: "boolean",
        width: 90,
        align: "center",
      },
      ...displays.map<GridColDef>(({ item }) => ({
        field: item.id,
        headerName: item.name,
        width: 160,
        type: "number",
        align: "right",
      })),
    ],
    [displays],
  );
  const { receipts } = useLoaderData<typeof clientLoader>();
  const me = useMember();
  const revalidator = useRevalidator();

  return (
    <DataGrid
      loading={revalidator.state === "loading"}
      slots={{ toolbar: GridToolbar }}
      rows={receipts.map(toRow)}
      columns={columns}
      checkboxSelection={me.register}
      getRowId={(row) => row.id}
      rowSelectionModel={selected}
      onRowSelectionModelChange={(selected) =>
        setSelected(selected.map(String))
      }
      sx={{ height: "100%" }}
    />
  );
}

function toRow({ records, ...rest }: IDBReceipt): {
  id: string;
  timestamp: Date;
  total: number;
  [itemId: `${bigint}`]: number;
} {
  const snowflake = Snowflake.parse(rest.id);
  return {
    ...rest,
    timestamp: new Date(snowflake ? snowflake.timestamp : 0),
    ...Object.fromEntries(records.map(({ itemId, count }) => [itemId, count])),
  };
}
