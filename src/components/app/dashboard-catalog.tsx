import { Wrench } from "lucide-react";
import Link from "next/link";
import {
  TOOL_DESTINATIONS,
  TOOL_ICONS,
} from "@/components/app/tool-destinations";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardCatalog() {
  return (
    <section
      aria-labelledby="dashboard-heading"
      className="flex w-full max-w-2xl flex-col gap-4 md:max-w-3xl"
    >
      <h1 id="dashboard-heading" className="sr-only">
        Dashboard
      </h1>
      <ul className="flex flex-col gap-4">
        {TOOL_DESTINATIONS.map((tool) => {
          const Icon = TOOL_ICONS[tool.href] ?? Wrench;

          return (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="block rounded-[min(var(--radius-4xl),24px)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full transition-colors hover:bg-muted/80">
                  <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2 md:gap-x-6 md:py-6">
                    <span
                      aria-hidden
                      className="row-span-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-foreground/10 md:size-16"
                    >
                      <Icon className="size-5 md:size-7" />
                    </span>
                    <CardTitle className="text-xl md:text-2xl">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-sm md:text-base">
                      {tool.explanation}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
