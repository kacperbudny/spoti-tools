import * as z from "zod";
import { VariantA } from "@/app/prototype-kac-43/variant-a";
import { VariantB } from "@/app/prototype-kac-43/variant-b";
import { VariantC } from "@/app/prototype-kac-43/variant-c";
import { VariantResolved } from "@/app/prototype-kac-43/variant-resolved";
import { PrototypeSwitcher } from "@/components/prototype/kac-43-switcher";

/**
 * PROTOTYPE — throwaway, answers KAC-43 (visual session for the late-night
 * look). Three variants of the shared token system — type pairing, canvas +
 * CTA green, radius/density, atmosphere, icon direction — applied across the
 * Landing door, Dashboard catalog, and Random album stage, switchable via
 * `?variant=`.
 *
 * Sub-shape B (new route): the question spans three separate routes
 * (`/`, `/app`, `/app/random-album`) that don't share a host page today, so
 * the surfaces are mocked together on one throwaway comparison route instead
 * of three. Real chrome (desktop sidebar, phone top bar — KAC-45) and the
 * live catalog (KAC-47) are out of scope here; this route only settles the
 * tokens those tickets will consume.
 *
 * Delete this route, its variant files, and the switcher once KAC-43 is
 * resolved and the winning tokens are recorded on the ticket.
 */

const VARIANTS = [
  { key: "A", name: "Tape Hiss" },
  { key: "B", name: "Signal" },
  { key: "C", name: "Velvet Room" },
  { key: "R", name: "Resolved" },
] as const;

const searchParamsSchema = z.object({
  variant: z.enum(["A", "B", "C", "R"]).optional(),
});

type PrototypePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PrototypeKac43Page({
  searchParams,
}: PrototypePageProps) {
  const { variant } = searchParamsSchema.parse(await searchParams);
  const current = variant ?? "A";

  return (
    <>
      {current === "A" ? <VariantA /> : null}
      {current === "B" ? <VariantB /> : null}
      {current === "C" ? <VariantC /> : null}
      {current === "R" ? <VariantResolved /> : null}
      {process.env.NODE_ENV !== "production" ? (
        <PrototypeSwitcher variants={VARIANTS} current={current} />
      ) : null}
    </>
  );
}
