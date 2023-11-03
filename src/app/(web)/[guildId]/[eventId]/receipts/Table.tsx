import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";
import CircularProgress from "@mui/material/CircularProgress";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import useReceiptExts, { ReceiptExt } from "./useReceiptExts";
import { useAlert } from "@/app/(web)/Alert";
import { useIDBDeleteReceipts } from "@/hooks/idb";
import { useDeleteReceipts, useEvent } from "@/hooks/swr";

const SelectedContext = createContext<{
  selected: string[];
  setSelected: (selected: string[]) => void;
}>({
  selected: [],
  setSelected: () => {},
});

export function SelectedProvider({ children }: PropsWithChildren) {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <SelectedContext.Provider value={{ selected, setSelected }}>
      {children}
    </SelectedContext.Provider>
  );
}

export default function Table({ eventcode }: { eventcode: string }) {
  const columns = useColumns(eventcode);
  const { receipts } = useReceiptExts(eventcode);
  const scopes = useScopes();
  const { selected, setSelected } = useContext(SelectedContext);

  if (!receipts) return <CircularProgress />;

  return (
    <DataGrid
      rows={receipts.map(toRow)}
      columns={columns}
      checkboxSelection={!!scopes?.write}
      getRowId={(row) => row.id}
      rowSelectionModel={selected}
      onRowSelectionModelChange={(selected) =>
        setSelected(selected.map(String))
      }
    />
  );
}

function useColumns(eventcode: string) {
  const { data: event } = useEvent({ eventcode });
  return useMemo<GridColDef[]>(
    () => [
      {
        field: "createdAt",
        headerName: "時刻",
        width: 160,
        valueGetter: ({ value }) => value.toLocaleString("ja-JP"),
      },
      { field: "total", headerName: "合計", width: 90, align: "right" },
      { field: "onServer", headerName: "同期", width: 90, align: "center" },
      ...(event?.items.map<GridColDef>(({ code, name }) => ({
        field: code,
        headerName: name,
        width: 160,
        align: "right",
      })) ?? []),
    ],
    [event],
  );
}

function toRow({ records, createdAt, onServer, ...rest }: ReceiptExt) {
  return {
    ...rest,
    createdAt: new Date(createdAt),
    onServer,
    ...Object.fromEntries(
      records.map(({ itemcode, count }) => [itemcode, count]),
    ),
  };
}

interface DeleteButtonProps extends LoadingButtonProps {
  eventcode: string;
}

export function DeleteButton({ eventcode, ...props }: DeleteButtonProps) {
  const { receipts, reload } = useReceiptExts(eventcode);
  const { trigger: triggerServer, isMutating: isDeletingServer } =
    useDeleteReceipts({ eventcode });
  const { trigger: triggerBrowser, isMutating: isDeletingBrowser } =
    useIDBDeleteReceipts(eventcode);
  const { selected } = useContext(SelectedContext);
  const { error } = useAlert();

  async function onClickDelete() {
    const rowsToDelete = receipts?.filter(({ id }) => selected.includes(id));
    if (!rowsToDelete?.length) return;

    const serverRows = rowsToDelete.filter(({ onServer }) => onServer);
    const browserRows = rowsToDelete.filter(({ onServer }) => !onServer);

    try {
      await Promise.all([
        serverRows.length && triggerServer(serverRows.map(({ id }) => id)),
        browserRows.length && triggerBrowser(browserRows),
      ]);
      await reload();
    } catch (e) {
      error("履歴の削除に失敗しました");
    }
  }

  return (
    <LoadingButton
      {...props}
      onClick={onClickDelete}
      disabled={selected.length === 0}
      loading={isDeletingServer || isDeletingBrowser}
    >
      履歴を削除
    </LoadingButton>
  );
}
