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

export const PrefetchLinkComponent = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<LinkComponentProps>
>(function PrefetchLinkComponent({ children, href, ...props }, ref) {
  return (
    <Link ref={ref} to={href} prefetch="render" {...props}>
      {children}
    </Link>
  );
});

export const NoDiscoverLinkComponent = forwardRef<
  HTMLAnchorElement,
  PropsWithChildren<LinkComponentProps>
>(function NoDiscoverLinkComponent({ children, href, ...props }, ref) {
  return (
    <Link ref={ref} to={href} discover="none" {...props}>
      {children}
    </Link>
  );
});
