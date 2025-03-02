import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Form,
  useFetcher,
  type SubmitFunction,
  type SubmitOptions,
} from "@remix-run/react";
import type { PropsWithChildren } from "react";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";

export interface RemixFormDialogProps<T extends FieldValues> {
  open: boolean;
  onClose: () => void;
  title: string;

  resolver: Resolver<T>;
  defaultValues: DefaultValues<T>;
  submitConfig?: SubmitOptions;
}

export function RemixFormDialog<T extends FieldValues>({
  children,
  open,
  onClose,
  title,
  ...args
}: PropsWithChildren<RemixFormDialogProps<T>>) {
  const { reset, handleSubmit, ...methods } = useRemixForm<T>(args);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      PaperProps={{ component: Form, onSubmit: handleSubmit }}
    >
      <RemixFormProvider {...methods} handleSubmit={null} reset={null}>
        <DialogTitle>{title}</DialogTitle>
        {children}
      </RemixFormProvider>
    </Dialog>
  );
}

export interface RemixFormDialogButtonsProps {
  submitButton: { label: string };
  deleteButton?: DeleteButtonProps | undefined;
}

export function RemixFormDialogActions({
  submitButton,
  deleteButton,
}: RemixFormDialogButtonsProps) {
  const { formState } = useRemixFormContext();
  const fetcher = useFetcher();
  const loading = formState.isLoading || fetcher.state !== "idle";

  return (
    <DialogActions>
      <LoadingButton type="submit" color="primary" loading={loading}>
        {submitButton.label}
      </LoadingButton>
      {deleteButton && (
        <LoadingButton
          color="error"
          onClick={() => fetcher.submit(null, deleteButton.submitConfig)}
          loading={loading}
        >
          {deleteButton.label}
        </LoadingButton>
      )}
    </DialogActions>
  );
}

export interface DeleteButtonProps {
  label: string;
  submitConfig: Parameters<SubmitFunction>[1];
}
