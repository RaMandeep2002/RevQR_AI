"use client";
import * as React from "react";
import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: LinkProps["href"];
  activeClassName?: string;
  pendingClassName?: string;
  className?: string;
  end?: boolean; // If true, link is only active on exact match
  to?: never; // For compatibility, prevent accidental 'to' usage
}

// Helper to check path match with 'end' support
function isActivePath(linkHref: string, currentPath: string, end: boolean = false) {
  if (end) {
    return currentPath === linkHref;
  }
  if (linkHref === "/") return currentPath === "/";
  return currentPath.startsWith(linkHref);
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    { className, activeClassName, href, end, ...props },
    ref
  ) => {
    const pathname = usePathname();
    const hrefString = typeof href === "string" ? href : (href?.toString() ?? "");
    const isActive = isActivePath(hrefString, pathname, end);

    // pendingClassName not supported in next/link (kept for compatibility)
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };