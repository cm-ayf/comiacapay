import {
  getFormProps,
  useForm,
  FormProvider,
  useFormMetadata,
  type DefaultValue,
  type FormMetadata,
} from "@conform-to/react";
import { parseWithValibot } from "@conform-to/valibot";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import { createContext, use, type PropsWithChildren } from "react";
import {
  useFetcher,
  type useLoaderData,
  type SubmitOptions,
  type FetcherWithComponents,
} from "react-router";
import type {
  ErrorMessage,
  InferInput,
  InferOutput,
  ObjectEntries,
  ObjectIssue,
  ObjectSchema,
} from "valibot";
import { useOnSubmitComplete } from "~/lib/fetcher";

type SerializeFrom<AppData> = ReturnType<typeof useLoaderData<AppData>>;
type Schema = ObjectSchema<
  ObjectEntries,
  ErrorMessage<ObjectIssue> | undefined
>;

export interface ConformDialogProps<TSchema extends Schema, Action> {
  open: boolean;
  onClose: () => void;
  title: string;

  schema: TSchema;
  defaultValue?: DefaultValue<InferOutput<NoInfer<TSchema>>>;
  submitConfig?: SubmitOptions;

  onSubmitComplete?: (data: SerializeFrom<Action>) => void;
}

interface ConformDialogFetcherContext {
  fetcher: FetcherWithComponents<unknown>;
  submitConfig: SubmitOptions;
}
const ConformDialogFetcherContext =
  createContext<ConformDialogFetcherContext | null>(null);

export function ConformDialog<TSchema extends Schema, Action>({
  children,
  open,
  onClose,
  title,
  schema,
  defaultValue = {},
  submitConfig = {},
  onSubmitComplete,
}: PropsWithChildren<ConformDialogProps<TSchema, Action>>) {
  const fetcher = useFetcher<Action>();

  const [form] = useForm({
    defaultValue,
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
      <FormProvider context={form.context}>
        <DialogTitle>{title}</DialogTitle>
        <ConformDialogFetcherContext value={{ fetcher, submitConfig }}>
          {children}
        </ConformDialogFetcherContext>
      </FormProvider>
    </Dialog>
  );
}

export function useFormFieldSet<TSchema extends Schema>(): ReturnType<
  FormMetadata<InferInput<TSchema>, string[]>["getFieldset"]
> {
  const form = useFormMetadata() as FormMetadata<InferInput<TSchema>, string[]>;
  return form.getFieldset();
}

export interface RemixFormDialogButtonsProps {
  submitButton: { label: string };
  deleteButton?:
    | { label: string; disabled: boolean; disabledMessage: string }
    | undefined;
}

export function ConformDialogActions({
  submitButton,
  deleteButton,
}: RemixFormDialogButtonsProps) {
  const context = use(ConformDialogFetcherContext);
  if (!context) {
    throw new Error("ConformDialogActions must be used within a ConformDialog");
  }
  const { fetcher, submitConfig } = context;

  return (
    <DialogActions>
      <Button type="submit" color="primary" loading={fetcher.state !== "idle"}>
        {submitButton.label}
      </Button>
      {deleteButton && (
        <OptionalTooltip
          title={deleteButton.disabledMessage}
          enabled={deleteButton.disabled}
        >
          <Button
            color="error"
            onClick={() =>
              fetcher.submit(null, { ...submitConfig, method: "DELETE" })
            }
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
