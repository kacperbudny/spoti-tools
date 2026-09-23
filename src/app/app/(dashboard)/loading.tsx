import { TOOLS } from "@/components/app/tools";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-8 md:max-w-3xl">
      <Skeleton className="h-9 w-[16ch] md:h-10" />
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-7 w-[5ch]" />
        <ul className="flex flex-col gap-4">
          {TOOLS.map(({ href }) => (
            <li key={href}>
              <Card className="h-full">
                <CardHeader className="grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2 md:gap-x-6 md:py-6">
                  <span
                    aria-hidden
                    className="row-span-2 size-12 shrink-0 rounded-full bg-cta/15 md:size-16"
                  />
                  <CardTitle className="text-xl md:text-2xl">
                    <Skeleton className="h-[1em] w-[11ch]" />
                  </CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    <Skeleton className="h-[1em] w-[36ch] max-w-full" />
                  </CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
