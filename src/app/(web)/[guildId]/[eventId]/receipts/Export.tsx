import Button from "@mui/material/Button";

export default function Export({ eventcode }: { eventcode: string }) {
  return (
    <Button
      variant="contained"
      href={`/api/events/${eventcode}/receipts/export`}
    >
      CSV
    </Button>
  );
}
