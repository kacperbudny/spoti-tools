import type { ReactNode } from "react";
import { DashboardCatalog } from "@/components/app/dashboard-catalog";

export function Dashboard({
  displayName,
  children,
}: {
  displayName: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 md:max-w-3xl">
      <h1 className="font-heading text-3xl font-medium tracking-tight md:text-4xl">
        Hello,{" "}
        <span className="text-cta">{displayName}</span>
        {"!"}
      </h1>
      <DashboardCatalog />
      {children}
    </div>
  );
}
