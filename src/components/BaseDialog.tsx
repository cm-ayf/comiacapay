import LoadingButton from "@mui/lab/LoadingButton";
import type { ButtonProps } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import type { PropsWithChildren } from "react";

interface BaseDialogButton {
  label: string;
  color?: ButtonProps["color"];
}

interface SubmitDialogButton extends BaseDialogButton {
  submit: true;
  onClick?: never;
}

interface PlainDialogButton extends BaseDialogButton {
  submit?: never;
  onClick: () => void | Promise<void>;
}

export type DialogButton = SubmitDialogButton | PlainDialogButton;

interface BaseDialogProps {
  title: string;
  open: boolean;
  onClose: () => void;
  loading: boolean;
  buttons: DialogButton[];
}

interface CreateDialogProps<T> extends BaseDialogProps {
  mode: "create";
  defaultValues?: never;
  onSubmit: (data: T) => void | Promise<void>;
}

interface UpdateDialogProps<T> extends BaseDialogProps {
  mode: "update";
  defaultValues: T;
  onSubmit: (data: Partial<T>) => void | Promise<void>;
}

export type DialogProps<T> = CreateDialogProps<T> | UpdateDialogProps<T>;

interface SubmitProps {
  disabled: boolean;
  onClick: () => void | Promise<void>;
}

export function BaseDialog({
  children,
  title,
  open,
  onClose,
  buttons,
  loading,
  reset,
  submitProps,
}: PropsWithChildren<
  BaseDialogProps & { reset: () => void; submitProps: SubmitProps }
>) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          rowGap: 1,
        }}
      >
        {children}
      </DialogContent>
      <DialogActions>
        {buttons.map(({ submit, onClick, label, color }, index) => (
          <LoadingButton
            key={index}
            color={color ?? "primary"}
            loading={loading}
            {...(submit ? submitProps : { onClick })}
          >
            {label}
          </LoadingButton>
        ))}
      </DialogActions>
    </Dialog>
  );
}
