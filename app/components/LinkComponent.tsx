import { forwardRef, type PropsWithChildren } from "react";
import { Link, type LinkProps } from "react-router";

export interface LinkComponentProps extends Omit<LinkProps, "to"> {
  href: string;
}

export const LinkComponent = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<LinkComponentProps>
>(function LinkComponent({ children, href, ...props }, ref) {
  return (
    <Link ref={ref} to={href} {...props}>
      {children}
    </Link>
  );
});
