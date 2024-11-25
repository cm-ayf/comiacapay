import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import type { MouseEventHandler, PropsWithChildren } from "react";
import { LinkComponent } from "./LinkComponent";

export type ClickableCardProps =
  | { href: string; onClick?: never }
  | { href?: never; onClick: MouseEventHandler<HTMLButtonElement> | undefined }
  | { href?: never; onClick?: never };

export default function ClickableCard({
  children,
  href,
  onClick,
}: PropsWithChildren<ClickableCardProps>) {
  return (
    <Card>
      {href ? (
        <CardActionArea LinkComponent={LinkComponent} href={href}>
          {children}
        </CardActionArea>
      ) : onClick ? (
        <CardActionArea onClick={onClick}>{children}</CardActionArea>
      ) : (
        children
      )}
    </Card>
  );
}
