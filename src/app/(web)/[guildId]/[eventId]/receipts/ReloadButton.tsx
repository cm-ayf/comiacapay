"use client";

import LoadingButton from "@mui/lab/LoadingButton";
import useReceiptsMerged from "./useReceiptsMerged";

export default function ReloadButton() {
  const { refetch, loading } = useReceiptsMerged();
  return (
    <LoadingButton
      variant="contained"
      loading={loading}
      onClick={() => refetch()}
    >
      更新
    </LoadingButton>
  );
}
