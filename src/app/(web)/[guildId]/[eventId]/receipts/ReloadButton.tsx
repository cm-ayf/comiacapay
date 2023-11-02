import LoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";
import useReceiptExts from "./useReceiptExts";

interface ReloadButtonProps extends LoadingButtonProps {
  eventcode: string;
}

export default function ReloadButton({
  eventcode,
  ...props
}: ReloadButtonProps) {
  const { reload, isReloading } = useReceiptExts(eventcode);
  return (
    <LoadingButton {...props} loading={isReloading} onClick={reload}>
      更新
    </LoadingButton>
  );
}
