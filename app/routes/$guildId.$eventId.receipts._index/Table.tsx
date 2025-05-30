import Delete from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
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
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import { jaJP } from "@mui/x-data-grid/locales";
import { createContext, use, useCallback, useMemo, useState } from "react";
import { useLoaderData, useParams, useRevalidator } from "react-router";
import { useFetcher } from "react-router";
import { useMember } from "../$guildId";
import { useDisplays } from "../$guildId.$eventId";
import type { clientLoader } from "./clientLoader";
import type { IDBReceipt } from "~/lib/idb.client";
import { Snowflake } from "~/lib/snowflake";

const DeleteButtonContext = createContext<{
  receipts: IDBReceipt[];
  rowSelectionModel: GridRowSelectionModel;
}>({
  receipts: [],
  rowSelectionModel: { type: "include", ids: new Set() },
});

export default function Table() {
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

  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  return (
    <ThemeProvider theme={localizedTheme}>
      <DeleteButtonContext value={{ receipts, rowSelectionModel }}>
        <DataGrid
          loading={revalidator.state === "loading"}
          showToolbar
          slots={{ toolbar: TableToolbar }}
          rows={receipts.map(toRow)}
          columns={columns}
          checkboxSelection={me.register}
          getRowId={(row) => row.id}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
          ignoreValueFormatterDuringExport
          sx={{ height: "100%" }}
        />
      </DeleteButtonContext>
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
      <Tooltip title="選択した履歴を削除">
        <span>
          <DeleteButton />
        </span>
      </Tooltip>
    </Toolbar>
  );
}

function DeleteButton() {
  const { receipts, rowSelectionModel } = use(DeleteButtonContext);
  const { guildId, eventId } = useParams();
  const fetcher = useFetcher();

  const searchParams = useMemo(() => {
    const searchParams = new URLSearchParams();
    switch (rowSelectionModel.type) {
      case "include":
        for (const id of rowSelectionModel.ids) {
          searchParams.append("id", String(id));
        }
        break;
      case "exclude":
        for (const receipt of receipts) {
          if (!rowSelectionModel.ids.has(receipt.id)) {
            searchParams.append("id", receipt.id);
          }
        }
        break;
    }
    return searchParams;
  }, [rowSelectionModel, receipts]);

  const onClick = useCallback(() => {
    if (searchParams.size === 0) return;

    fetcher.submit(null, {
      method: "DELETE",
      action: `/${guildId}/${eventId}/receipts?${searchParams}`,
    });
  }, [fetcher, guildId, eventId, searchParams]);

  return (
    <ToolbarButton
      onClick={onClick}
      disabled={searchParams.size === 0 || fetcher.state !== "idle"}
    >
      {fetcher.state === "idle" ? (
        <Delete fontSize="small" />
      ) : (
        <CircularProgress color="inherit" size={20} />
      )}
    </ToolbarButton>
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
