"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { InstallNavFooter } from "@/components/app/install-section";
import {
  DASHBOARD_HREF,
  TOOL_DESTINATIONS,
} from "@/components/app/tool-destinations";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type AuthenticatedShellProps = {
  displayName: string;
  pathname: string;
  children?: ReactNode;
};

export function AuthenticatedShell({
  displayName,
  pathname,
  children,
}: AuthenticatedShellProps) {
  const isDashboard = isDashboardPath(pathname);

  return (
    <div className="flex flex-1">
      <nav className="hidden w-56 shrink-0 flex-col border-r border-border md:flex">
        <ul className="flex flex-1 flex-col gap-1 p-3">
          <li>
            <NavLink href={DASHBOARD_HREF} pathname={pathname}>
              Dashboard
            </NavLink>
          </li>
          {TOOL_DESTINATIONS.map((tool) => (
            <li key={tool.href}>
              <NavLink href={tool.href} pathname={pathname}>
                {tool.name}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="p-3">
          <SignOutButton />
        </div>
        <div className="p-3 pt-0">
          <InstallNavFooter />
        </div>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        {isDashboard ? (
          <header className="flex items-center justify-between gap-4 p-4 md:hidden">
            <p>{displayName}</p>
            <SignOutButton />
          </header>
        ) : (
          <header className="flex items-center p-4 md:hidden">
            <Link
              href={DASHBOARD_HREF}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to Dashboard
            </Link>
          </header>
        )}
        <main className="flex flex-1 flex-col items-center gap-8 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AuthenticatedShellFromRoute({
  displayName,
  children,
}: {
  displayName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AuthenticatedShell displayName={displayName} pathname={pathname}>
      {children}
    </AuthenticatedShell>
  );
}

function isDashboardPath(pathname: string) {
  return isCurrentPath(pathname, DASHBOARD_HREF);
}

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

function NavLink({
  href,
  pathname,
  children,
}: {
  href: string;
  pathname: string;
  children: ReactNode;
}) {
  const isCurrent = isCurrentPath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "block rounded-2xl px-3 py-2 text-sm transition-colors hover:bg-muted",
        isCurrent && "bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        Sign-out
      </Button>
    </form>
  );
}
