import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import {
  createContext,
  useCallback,
  useContext,
  type PropsWithChildren,
} from "react";
import type { DefaultValues, FieldValues, Resolver } from "react-hook-form";
import {
  useFetcher,
  type useLoaderData,
  type SubmitOptions,
} from "react-router";
import {
  RemixFormProvider,
  useRemixForm,
  useRemixFormContext,
} from "remix-hook-form";
import { useOnSubmitComplete } from "~/lib/fetcher";

type SerializeFrom<AppData> = ReturnType<typeof useLoaderData<AppData>>;

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
  deleteButton?:
    | { label: string; disabled: boolean; disabledMessage: string }
    | undefined;
}

export function RemixFormDialogActions({
  submitButton,
  deleteButton,
}: RemixFormDialogButtonsProps) {
  const { formState } = useRemixFormContext();
  const handleDelete = useContext(HandleDeleteContext);

  return (
    <DialogActions>
      <Button type="submit" color="primary" loading={formState.isLoading}>
        {submitButton.label}
      </Button>
      {deleteButton && (
        <OptionalTooltip
          title={deleteButton.disabledMessage}
          enabled={deleteButton.disabled}
        >
          <Button
            color="error"
            onClick={handleDelete}
            loading={formState.isLoading}
            disabled={deleteButton.disabled}
          >
            {deleteButton.label}
          </Button>
        </OptionalTooltip>
      )}
    </DialogActions>
  );
}

function OptionalTooltip({
  title,
  enabled,
  children,
}: PropsWithChildren<{ title: string; enabled: boolean }>) {
  if (enabled)
    return (
      <Tooltip title={title}>
        <span>{children}</span>
      </Tooltip>
    );
  else return children;
}
