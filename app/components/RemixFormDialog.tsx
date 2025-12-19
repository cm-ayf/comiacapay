import { getFormProps, useForm, type FieldMetadata } from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import { createContext, use, useCallback, type PropsWithChildren } from "react";
import {
  useFetcher,
  type useLoaderData,
  type SubmitOptions,
} from "react-router";
import type { BaseSchema } from "valibot";
import { useOnSubmitComplete } from "~/lib/fetcher";

type SerializeFrom<AppData> = ReturnType<typeof useLoaderData<AppData>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RemixFormDialogProps<T extends Record<string, any>, U> {
  open: boolean;
  onClose: () => void;
  title: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: BaseSchema<unknown, T, any>;
  defaultValue?: T | undefined;
  submitConfig?: SubmitOptions;

  onSubmitComplete?: (data: SerializeFrom<U>) => void;
}

const HandleDeleteContext = createContext<(() => void) | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormFieldsContext = createContext<Record<string, FieldMetadata<any>> | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RemixFormDialog<T extends Record<string, any>, U = unknown>({
  children,
  open,
  onClose,
  title,
  schema,
  defaultValue,
  submitConfig = {},
  onSubmitComplete,
}: PropsWithChildren<RemixFormDialogProps<T, U>>) {
  const fetcher = useFetcher<U>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, fields] = useForm<T>({
    defaultValue: defaultValue as any,
    onValidate({ formData }) {
      return parseWithValibot(formData, { schema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useOnSubmitComplete(fetcher, (data) => {
    onClose();
    form.reset();
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
        form.reset();
      }}
      PaperProps={{ 
        component: fetcher.Form,
        ...getFormProps(form),
        ...submitConfig,
      }}
    >
      <FormFieldsContext value={fields}>
        <DialogTitle>{title}</DialogTitle>
        <HandleDeleteContext value={handleDelete}>
          {children}
        </HandleDeleteContext>
      </FormFieldsContext>
    </Dialog>
  );
}

export function useFormFields() {
  const fields = use(FormFieldsContext);
  if (!fields) throw new Error("useFormFields must be used within RemixFormDialog");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return fields as Record<string, FieldMetadata<any, any, string[]>>;
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
  const handleDelete = use(HandleDeleteContext);
  const fetcher = useFetcher();

  return (
    <DialogActions>
      <Button
        type="submit"
        color="primary"
        loading={fetcher.state !== "idle"}
      >
        {submitButton.label}
      </Button>
      {deleteButton && handleDelete && (
        <OptionalTooltip
          title={deleteButton.disabledMessage}
          enabled={deleteButton.disabled}
        >
          <Button
            color="error"
            onClick={handleDelete}
            loading={fetcher.state !== "idle"}
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
