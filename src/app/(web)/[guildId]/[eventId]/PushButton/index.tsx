"use client";

import { useMutation } from "@apollo/client";
import CloudDone from "@mui/icons-material/CloudDone";
import CloudUpload from "@mui/icons-material/CloudUpload";
import LoadingButton, { type LoadingButtonProps } from "@mui/lab/LoadingButton";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { useReceipts, useSetReceiptsPushed } from "../idb";
import type { Params } from "../params";
import CreateReceiptsMutation from "./CreateReceipts.graphql";
import { useAlert } from "@/app/(web)/Alert";
import { assertSuccess } from "@/app/(web)/Apollo";
import type { CreateReceipt } from "@/generated/schema";

export default function PushButton(props: Pick<LoadingButtonProps, "size">) {
  const params = useParams<Params>();
  const { receipts, loading } = useReceipts();
  const receiptsToPush = useMemo(() => {
    return receipts
      ?.filter(({ pushed }) => !pushed)
      .map<CreateReceipt>(({ id, total, records }) => ({ id, total, records }));
  }, [receipts]);
  const [triggerPush, { loading: pushing }] = useMutation(
    CreateReceiptsMutation,
  );
  const [triggerSetPushed, { loading: settingPushed }] =
    useSetReceiptsPushed(params);

  const { info, error } = useAlert();

  const push = useCallback(
    async (input: CreateReceipt[]) => {
      try {
        const result = await triggerPush({
          variables: { ...params, input },
        });
        assertSuccess(result);
        if (
          input.every((input) =>
            result.data.createReceipts.some((result) => result.id === input.id),
          )
        ) {
          await triggerSetPushed(input.map(({ id }) => id));
        } else {
          error("一部のデータが同期できませんでした");
        }
      } catch (e) {
        error("同期に失敗しました");
      }
    },
    [triggerPush, triggerSetPushed, error, params],
  );

  useEffect(() => {
    if (receiptsToPush && receiptsToPush.length > 10) {
      info("同期されていないデータがあります");
    }
  }, [receiptsToPush, info]);

  useEffect(() => {
    if (!receiptsToPush?.length) return;
    const id = setTimeout(push, 5000, receiptsToPush);
    return () => clearTimeout(id);
  }, [push, receiptsToPush]);

  return (
    <LoadingButton
      {...props}
      variant="outlined"
      loading={loading || pushing || settingPushed}
      startIcon={receiptsToPush?.length ? <CloudUpload /> : <CloudDone />}
      disabled={!receiptsToPush?.length}
      onClick={() => receiptsToPush && push(receiptsToPush)}
    >
      同期
    </LoadingButton>
  );
}
