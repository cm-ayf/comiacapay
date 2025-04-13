import LoadingButton from "@mui/lab/LoadingButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import {
  useFetcher,
  type SubmitFunction,
  type SubmitOptions,
} from "@remix-run/react";
import type { SerializeFrom } from "@vercel/remix";
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from "react";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";
import { useOnSubmitComplete } from "~/lib/fetcher";

export interface RemixFormDialogProps<T extends FieldValues, U> {
  open: boolean;
  onClose: () => void;
  title: string;

  resolver: Resolver<T>;
  defaultValues: DefaultValues<NoInfer<T>>;
  submitConfig?: SubmitOptions;

  onSubmitComplete?: (data: SerializeFrom<U> | undefined) => void;
}

const HandleDeleteContext = createContext<() => void>(() => {});

export function RemixFormDialog<T extends FieldValues, U = unknown>({
  children,
  open,
  onClose,
  title,
  resolver,
  defaultValues,
  submitConfig = {},
  onSubmitComplete,
}: PropsWithChildren<RemixFormDialogProps<T, U>>) {
  const fetcher = useFetcher<U>();
  const { reset, handleSubmit, ...methods } = useRemixForm<T>({
    resolver,
    defaultValues,
    fetcher,
    submitConfig,
  });

  useOnSubmitComplete(fetcher, (data) => {
    onClose();
    reset();
    onSubmitComplete?.(data);
  });

  const handleDelete = useCallback(
    () => fetcher.submit(null, { ...submitConfig, method: "DELETE" }),
    [fetcher, submitConfig],
  );

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      PaperProps={{ component: fetcher.Form, onSubmit: handleSubmit }}
    >
      <RemixFormProvider {...methods} handleSubmit={null} reset={null}>
        <DialogTitle>{title}</DialogTitle>
        <HandleDeleteContext.Provider value={handleDelete}>
          {children}
        </HandleDeleteContext.Provider>
      </RemixFormProvider>
    </Dialog>
  );
}

export interface RemixFormDialogButtonsProps {
  submitButton: { label: string };
  deleteButton?: { label: string } | undefined;
}

export function RemixFormDialogActions({
  submitButton,
  deleteButton,
}: RemixFormDialogButtonsProps) {
  const { formState } = useRemixFormContext();
  const handleDelete = useContext(HandleDeleteContext);

  return (
    <DialogActions>
      <LoadingButton
        type="submit"
        color="primary"
        loading={formState.isLoading}
      >
        {submitButton.label}
      </LoadingButton>
      {deleteButton && (
        <LoadingButton
          color="error"
          onClick={handleDelete}
          loading={formState.isLoading}
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
