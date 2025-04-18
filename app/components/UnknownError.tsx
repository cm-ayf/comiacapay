import ExpandMore from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";

export function UnknownError({ error }: { error: unknown }) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="body2">不明なエラーが発生しました：</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <pre>
          <code>{JSON.stringify(error, null, 2)}</code>
        </pre>
      </AccordionDetails>
    </Accordion>
  );
}
