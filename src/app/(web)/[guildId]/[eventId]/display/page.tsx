import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import type { Params } from "../params";
import { initPrisma } from "@/app/(api)/prisma";
import DummyItemPicture from "@/components/DummyItemPicture";

export default async function Display({ params }: { params: Params }) {
  const prisma = await initPrisma();
  const event = await prisma.event.findUnique({
    where: {
      id: params.eventId,
      guildId: params.guildId,
    },
    include: {
      guild: true,
      displays: {
        include: { item: true },
      },
    },
  });
  if (!event) return <div>Event not found</div>;
  return (
    <Grid container spacing={2} sx={{ width: "90%", m: "auto" }}>
      {event.displays.map(({ item, price }) => (
        <Grid item xs={6} key={item.id}>
          <Card sx={{ height: 300, width: "100%", display: "flex" }}>
            {item.picture ? (
              <CardMedia
                component="img"
                image={item.picture}
                alt={item.name}
                sx={{ width: 300 }}
              />
            ) : (
              <DummyItemPicture item={item} sx={{ width: 300 }} />
            )}
            <CardContent
              sx={{ width: "100%", display: "flex", flexDirection: "column" }}
            >
              <Typography sx={{ fontSize: "4em" }}>{item.name}</Typography>
              <Typography sx={{ flex: 1 }} />
              <Typography sx={{ fontSize: "4em", pl: 2 }}>¥{price}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
