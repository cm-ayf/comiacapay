import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import type { ElementType, MouseEventHandler, PropsWithChildren } from "react";
import { LinkComponent as DefaultLinkComponent } from "./LinkComponent";

type OnClick = MouseEventHandler<HTMLButtonElement> | undefined;

export type ClickableCardProps =
  | { href: string; LinkComponent?: ElementType; onClick?: never }
  | { href?: never; LinkComponent?: never; onClick?: OnClick };

export default function ClickableCard({
  children,
  href,
  LinkComponent = DefaultLinkComponent,
  onClick,
}: PropsWithChildren<ClickableCardProps>) {
  return (
    <Card sx={{ minWidth: "250px" }}>
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
