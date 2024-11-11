import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import type { MouseEventHandler, PropsWithChildren } from "react";

export default function ClickableCard({
  children,
  onClick,
}: PropsWithChildren<{
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
}>) {
  return (
    <Card>
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ m: 0, p: 0 }}>
          {children}
        </CardActionArea>
      ) : (
        children
      )}
    </Card>
  );
}
