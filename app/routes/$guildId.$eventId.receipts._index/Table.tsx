import {
  DataGrid,
  gridDateTimeFormatter,
  GridToolbar,
  type GridColDef,
} from "@mui/x-data-grid";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useMemo } from "react";
import { useMember } from "../$guildId";
import { useDisplays } from "../$guildId.$eventId";
import type { loader } from "./loader";
import type { ClientReceipt } from "~/lib/schema";
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
        field: "datetime",
        headerName: "時刻",
        width: 160,
        valueGetter: gridDateTimeFormatter,
      },
      { field: "total", headerName: "合計", width: 90, align: "right" },
      // { field: "pushed", headerName: "同期", width: 90, align: "center" },
      ...displays.map<GridColDef>(({ item }) => ({
        field: item.id,
        headerName: item.name,
        width: 160,
        align: "right",
      })),
    ],
    [displays],
  );
  const receipts = useLoaderData<typeof loader>();
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

function toRow({ records, ...rest }: ClientReceipt): {
  id: string;
  datetime: Date;
  total: number;
  [itemId: `${bigint}`]: number;
} {
  const snowflake = Snowflake.parse(rest.id);
  return {
    ...rest,
    datetime: new Date(snowflake ? snowflake.timestamp : 0),
    ...Object.fromEntries(records.map(({ itemId, count }) => [itemId, count])),
  };
}
