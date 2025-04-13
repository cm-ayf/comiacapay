import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material-pigment-css/Box";
import Grid from "@mui/material-pigment-css/Grid";
import { useDisplays } from "../$guildId.$eventId";
import { CreateReceiptButton } from "./CreateReceiptButton";
import { RegisterDisplayPanel } from "./RegisterDisplayPanel";
import type { Handle } from "~/lib/handle";
import { useTotal } from "~/lib/register";

export default function Register() {
  const { displays } = useDisplays();
  return (
    <Grid container spacing={16}>
      {displays.map((display) => (
        <Grid size={{ xs: 12, lg: 6 }} key={display.itemId}>
          <RegisterDisplayPanel display={display} />
        </Grid>
      ))}
    </Grid>
  );
}

export const handle: Handle<unknown> = {
  breadcrumbLabel: () => "レジ",
  containerMaxWidth: false,
  ButtomComponent: RegisterConsole,
};

function RegisterConsole() {
  return (
    <Paper
      component="footer"
      variant="outlined"
      square
      sx={{
        height: 80,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        px: 2,
      }}
    >
      <Box sx={{ flex: 1 }} />
      <Price />
      <CreateReceiptButton />
    </Paper>
  );
}

function Price() {
  const price = useTotal();

  return (
    <Typography variant="caption" sx={{ px: 2, fontSize: "3em" }}>
      ¥{price}
    </Typography>
  );
}
