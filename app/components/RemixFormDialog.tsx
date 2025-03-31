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

export interface RemixFormDialogProps<T extends FieldValues> {
  open: boolean;
  onClose: () => void;
  title: string;

  resolver: Resolver<T>;
  defaultValues: DefaultValues<NoInfer<T>>;
  submitConfig?: SubmitOptions;
}

const HandleDeleteContext = createContext<() => void>(() => {});

export function RemixFormDialog<T extends FieldValues>({
  children,
  open,
  onClose,
  title,
  resolver,
  defaultValues,
  submitConfig = {},
}: PropsWithChildren<RemixFormDialogProps<T>>) {
  const fetcher = useFetcher();
  const { reset, handleSubmit, ...methods } = useRemixForm<T>({
    resolver,
    defaultValues,
    fetcher,
    submitConfig,
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
      PaperProps={{ component: Form, onSubmit: handleSubmit }}
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
