"use client";

import {
  ArrowLeft,
  Disc3,
  LayoutDashboard,
  LogOut,
  Waves,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { InstallNavFooter } from "@/components/app/install-section";
import {
  DASHBOARD_HREF,
  TOOL_DESTINATIONS,
} from "@/components/app/tool-destinations";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type AuthenticatedShellProps = {
  displayName: string;
  email: string;
  pathname: string;
  children?: ReactNode;
};

export function AuthenticatedShell({
  displayName,
  email,
  pathname,
  children,
}: AuthenticatedShellProps) {
  return (
    <div className="flex flex-1">
      <nav
        aria-label="Primary"
        className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex"
      >
        <div className="relative overflow-hidden px-5 pt-6 pb-5">
          <BrandGlow />
          <div className="relative">
            <BrandLockup />
          </div>
        </div>

        <div className="h-px shrink-0 bg-sidebar-border" />

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
          <ul className="flex flex-col gap-1">
            <li>
              <NavLink
                href={DASHBOARD_HREF}
                pathname={pathname}
                icon={LayoutDashboard}
              >
                Dashboard
              </NavLink>
            </li>
          </ul>

          <div className="flex flex-col gap-2">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tools
            </p>
            <ul className="flex flex-col gap-1">
              {TOOL_DESTINATIONS.map((tool) => (
                <li key={tool.href}>
                  <NavLink
                    href={tool.href}
                    pathname={pathname}
                    icon={TOOL_ICONS[tool.href] ?? Wrench}
                  >
                    {tool.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-sidebar-border p-3">
          <InstallNavFooter />
          <UserChip displayName={displayName} email={email} />
        </div>
      </nav>
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar displayName={displayName} pathname={pathname} />
        <main className="flex flex-1 flex-col items-center gap-8 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AuthenticatedShellFromRoute({
  displayName,
  email,
  children,
}: {
  displayName: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  return (
    <AuthenticatedShell
      displayName={displayName}
      email={email}
      pathname={pathname}
    >
      {children}
    </AuthenticatedShell>
  );
}

type IconComponent = typeof LayoutDashboard;

const TOOL_ICONS: Record<string, IconComponent> = {
  "/app/random-album": Disc3,
};

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname === `${href}/`;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

function NavLink({
  href,
  pathname,
  icon: Icon,
  children,
}: {
  href: string;
  pathname: string;
  icon: IconComponent;
  children: ReactNode;
}) {
  const isCurrent = isCurrentPath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={isCurrent ? "page" : undefined}
      className={cn(
        "group flex items-center gap-2.5 rounded-2xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isCurrent && "bg-sidebar-accent text-sidebar-foreground",
      )}
    >
      <Icon
        aria-hidden
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-cta",
          isCurrent && "text-cta",
        )}
      />
      {children}
    </Link>
  );
}

function MobileTopBar({
  displayName,
  pathname,
}: {
  displayName: string;
  pathname: string;
}) {
  const isDashboard = isCurrentPath(pathname, DASHBOARD_HREF);

  return (
    <header className="sticky top-0 z-20 border-b border-sidebar-border bg-sidebar pt-[env(safe-area-inset-top)] text-sidebar-foreground md:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        {isDashboard ? (
          <>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-cta text-cta-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--cta),transparent_65%)]">
              <Waves aria-hidden className="size-4" />
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-heading text-xs font-medium"
              >
                {initials(displayName)}
              </span>
              <span className="truncate text-sm font-medium">{displayName}</span>
              <SignOutIconButton />
            </div>
          </>
        ) : (
          <Link
            href={DASHBOARD_HREF}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back to Dashboard
          </Link>
        )}
      </div>
    </header>
  );
}

function BrandGlow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-10 -left-8 size-32 rounded-full bg-cta/25 blur-3xl"
    />
  );
}

function BrandLockup() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cta text-cta-foreground shadow-[0_0_20px_color-mix(in_oklch,var(--cta),transparent_65%)]">
        <Waves aria-hidden className="size-5" />
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-lg font-medium tracking-tight">
          SpotiTools
        </span>
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Spotify toolbox
        </span>
      </div>
    </div>
  );
}

function UserChip({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-sidebar-accent px-3 py-2.5">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground/10 font-heading text-sm font-medium"
      >
        {initials(displayName)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-medium">{displayName}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
      <SignOutIconButton />
    </div>
  );
}

function SignOutIconButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label="Sign-out"
        className="text-muted-foreground hover:text-destructive"
      >
        <LogOut aria-hidden className="size-4" />
      </Button>
    </form>
  );
}
