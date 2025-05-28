import { extendTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import {
  ColumnsPanelTrigger,
  DataGrid,
  ExportCsv,
  FilterPanelTrigger,
  GridFilterListIcon,
  GridViewColumnIcon,
  GridDownloadIcon,
  Toolbar,
  ToolbarButton,
  type GridColDef,
} from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { useMemo } from "react";
import { useLoaderData, useRevalidator } from "react-router";
import { useMember } from "../$guildId";
import { useDisplays } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import type { IDBReceipt } from "~/lib/idb.client";
import { Snowflake } from "~/lib/snowflake";

export default function Table(
  {
    // selected,
    // setSelected,
  }: {
    selected: string[];
    setSelected: (ids: string[]) => void;
  },
) {
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
        valueFormatter: (value: number) => `¥${value.toLocaleString()}`,
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
        valueGetter: (value: number | undefined) => value ?? 0,
        valueFormatter: (value: number) => (value ? String(value) : ""),
      })),
    ],
    [displays],
  );
  const { receipts } = useLoaderData<typeof clientLoader>();
  const me = useMember();
  const revalidator = useRevalidator();

  const theme = useTheme();
  const localizedTheme = useMemo(() => extendTheme(theme, jaJP), [theme]);

  return (
    <ThemeProvider theme={localizedTheme}>
      <DataGrid
        loading={revalidator.state === "loading"}
        showToolbar
        slots={{ toolbar: TableToolbar }}
        rows={receipts.map(toRow)}
        columns={columns}
        checkboxSelection={me.register}
        getRowId={(row) => row.id}
        // rowSelectionModel={selected}
        // onRowSelectionModelChange={(selected) =>
        //   setSelected(selected.map(String))
        // }
        ignoreValueFormatterDuringExport
        sx={{ height: "100%" }}
      />
    </ThemeProvider>
  );
}

function TableToolbar() {
  return (
    <Toolbar>
      <ColumnsPanelTrigger render={<ToolbarButton />}>
        <GridViewColumnIcon fontSize="small" />
      </ColumnsPanelTrigger>
      <FilterPanelTrigger render={<ToolbarButton />}>
        <GridFilterListIcon fontSize="small" />
      </FilterPanelTrigger>
      <ExportCsv render={<ToolbarButton />}>
        <GridDownloadIcon fontSize="small" />
      </ExportCsv>
    </Toolbar>
  );
}

interface Row {
  id: string;
  timestamp: Date;
  total: number;
  [itemId: `${bigint}`]: number;
}

function toRow({ records, ...rest }: IDBReceipt): Row {
  const snowflake = Snowflake.parse(rest.id);
  return {
    ...rest,
    timestamp: new Date(snowflake ? snowflake.timestamp : 0),
    ...Object.fromEntries(records.map(({ itemId, count }) => [itemId, count])),
  };
}
