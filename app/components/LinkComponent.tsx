import { Link } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { forwardRef, type PropsWithChildren } from "react";

export interface LinkComponentProps extends Omit<RemixLinkProps, "to"> {
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
