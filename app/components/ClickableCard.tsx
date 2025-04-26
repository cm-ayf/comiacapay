import Card from "@mui/material/Card";
import CardActionArea, {
  type CardActionAreaProps,
} from "@mui/material/CardActionArea";
import type { PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router";

export type ClickableCardProps =
  | (Pick<LinkProps, "to" | "discover" | "prefetch" | "reloadDocument"> & {
      onClick?: never;
    })
  | { to?: never; onClick?: CardActionAreaProps["onClick"] };

export default function ClickableCard({
  children,
  onClick,
  ...props
}: PropsWithChildren<ClickableCardProps>) {
  return (
    <Card>
      {props.to ? (
        <CardActionArea component={Link} {...props}>
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
