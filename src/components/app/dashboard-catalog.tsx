import Link from "next/link";
import { TOOLS } from "@/components/app/tools";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DashboardCatalog() {
  return (
    <section
      aria-labelledby="tools-heading"
      className="flex w-full flex-col gap-3"
    >
      <h2 id="tools-heading" className="text-lg font-medium">
        Tools
      </h2>
      <ul className="flex flex-col gap-4">
        {TOOLS.map(({ href, name, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-[min(var(--radius-4xl),24px)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors hover:bg-muted/80">
                <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2 md:gap-x-6 md:py-6">
                  <span
                    aria-hidden
                    className="row-span-2 flex size-12 shrink-0 items-center justify-center rounded-full bg-cta/15 text-cta md:size-16"
                  >
                    <Icon className="size-5 md:size-7" />
                  </span>
                  <CardTitle className="text-xl md:text-2xl">{name}</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
