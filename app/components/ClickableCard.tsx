import Card from "@mui/material/Card";
import CardActionArea, {
  type CardActionAreaProps,
} from "@mui/material/CardActionArea";
import type { PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router";

export type ClickableCardProps =
  | (Pick<LinkProps, "to" | "discover" | "prefetch" | "reloadDocument"> & {
      "aria-label"?: string;
      onClick?: never;
    })
  | {
      to?: never;
      onClick?: CardActionAreaProps["onClick"];
      "aria-label"?: string;
    };

export default function ClickableCard({
  children,
  onClick,
  "aria-label": ariaLabel,
  ...props
}: PropsWithChildren<ClickableCardProps>) {
  return (
    <Card>
      {props.to ? (
        <CardActionArea component={Link} {...props} aria-label={ariaLabel}>
          {children}
        </CardActionArea>
      ) : onClick ? (
        <CardActionArea onClick={onClick} aria-label={ariaLabel}>
          {children}
        </CardActionArea>
      ) : (
        children
      )}
    </Card>
  );
}
