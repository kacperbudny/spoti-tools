import { Disc3 } from "lucide-react";
import { Fraunces, Karla } from "next/font/google";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * PROTOTYPE variant A — "Tape Hiss". Warm near-black canvas, a soft film-grain
 * atmosphere, a serif display paired with a humanist body, generous soft
 * radius, and switches for Album types. See variant-b/variant-c for the two
 * other directions and page.tsx for the scope note.
 */

const display = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--pt-a-display",
});

const body = Karla({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pt-a-body",
});

const NOISE_URL = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>',
)}`;

const vars = {
  "--pt-canvas": "oklch(0.17 0.014 55)",
  "--pt-canvas-raised": "oklch(0.23 0.018 55)",
  "--pt-fg": "oklch(0.94 0.012 60)",
  "--pt-fg-muted": "oklch(0.68 0.02 55)",
  "--pt-border": "oklch(1 0 0 / 8%)",
  "--pt-cta": "oklch(0.72 0.13 148)",
  "--pt-cta-fg": "oklch(0.16 0.03 148)",
  "--radius": "0.9rem",
  fontFamily: "var(--pt-a-body)",
} as CSSProperties;

const displayStyle = { fontFamily: "var(--pt-a-display)" } as CSSProperties;
const displayItalicStyle = {
  fontFamily: "var(--pt-a-display)",
  fontStyle: "italic",
} as CSSProperties;

const ALBUM_TYPE_LABELS = ["Album", "Single/EP", "Compilation"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.2em] text-[var(--pt-fg-muted)]">
      {children}
    </p>
  );
}

export function VariantA() {
  return (
    <div
      className={cn(
        "dark relative min-h-screen w-full overflow-hidden",
        display.variable,
        body.variable,
      )}
      style={vars}
    >
      <div className="absolute inset-0 bg-[var(--pt-canvas)]" />
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage: `url("${NOISE_URL}")`,
          backgroundSize: "140px 140px",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-16 px-6 py-16 pb-32 text-[var(--pt-fg)]">
        {/* 01 — Landing door */}
        <section className="flex flex-col items-center gap-5 text-center">
          <Eyebrow>01 — Landing door</Eyebrow>
          <div className="flex w-full flex-col items-center gap-4 rounded-[28px] border border-[var(--pt-border)] bg-[var(--pt-canvas-raised)] px-8 py-16">
            <p className="text-3xl" style={displayStyle}>
              SpotiTools
            </p>
            <button
              type="button"
              className="rounded-full px-7 py-3 text-sm font-medium"
              style={{ background: "var(--pt-cta)", color: "var(--pt-cta-fg)" }}
            >
              Sign-in with Spotify
            </button>
            <p role="alert" className="text-xs text-[var(--pt-fg-muted)]">
              Sign-in did not complete. You can try again.
            </p>
          </div>
        </section>

        {/* 02 — Dashboard catalog */}
        <section className="flex flex-col gap-5">
          <Eyebrow>02 — Dashboard catalog</Eyebrow>
          <div className="flex items-center justify-between">
            <p className="text-lg" style={displayStyle}>
              Jordan
            </p>
            <button
              type="button"
              className="rounded-full border border-[var(--pt-border)] px-4 py-1.5 text-xs"
            >
              Sign-out
            </button>
          </div>
          <div className="flex items-center gap-4 rounded-[28px] border border-[var(--pt-border)] bg-[var(--pt-canvas-raised)] p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--pt-border)] bg-[var(--pt-canvas)]">
              <Disc3 className="size-5" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base" style={displayStyle}>
                Random album
              </p>
              <p className="text-sm text-[var(--pt-fg-muted)]">
                A random Album from your saved Library.
              </p>
            </div>
          </div>
        </section>

        {/* 03 — Random album, idle */}
        <section className="flex flex-col gap-5">
          <Eyebrow>03 — Random album · idle</Eyebrow>
          <p className="text-2xl" style={displayStyle}>
            Random album
          </p>
          <div className="flex flex-col gap-2">
            {ALBUM_TYPE_LABELS.map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-[20px] border border-[var(--pt-border)] bg-[var(--pt-canvas-raised)] px-4 py-3"
              >
                <span className="text-sm">{label}</span>
                <span className="inline-flex h-5 w-8 items-center rounded-full px-0.5 [background:color-mix(in_oklch,var(--pt-cta),transparent_25%)]">
                  <span className="ml-auto size-4 rounded-full bg-[var(--pt-canvas)]" />
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="rounded-full px-7 py-3 text-sm font-medium"
            style={{ background: "var(--pt-cta)", color: "var(--pt-cta-fg)" }}
          >
            Start
          </button>
        </section>

        {/* 04 — Random album, pick */}
        <section className="flex flex-col gap-4">
          <Eyebrow>04 — Random album · pick</Eyebrow>
          <div
            className="aspect-square w-full rounded-[28px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 20%, oklch(0.32 0.05 60), oklch(0.14 0.02 40))",
            }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xl" style={displayStyle}>
              In Rainbows
            </p>
            <p className="text-[var(--pt-fg-muted)]" style={displayItalicStyle}>
              Radiohead
            </p>
            <p className="text-sm text-[var(--pt-fg-muted)]">2007 · Album</p>
          </div>
          <button
            type="button"
            className="rounded-full px-7 py-3 text-sm font-medium"
            style={{ background: "var(--pt-cta)", color: "var(--pt-cta-fg)" }}
          >
            Listen on Spotify
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--pt-border)] px-7 py-2.5 text-sm text-[var(--pt-fg-muted)]"
          >
            Re-shuffle
          </button>
        </section>

        {/* 05 — Green usage sampler */}
        <section className="flex flex-col gap-3">
          <Eyebrow>05 — Green usage sampler</Eyebrow>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--pt-canvas-raised)]">
            <div
              className="h-full w-2/3 rounded-full"
              style={{ background: "var(--pt-cta)" }}
            />
          </div>
          <p className="text-xs text-[var(--pt-fg-muted)]">
            Library crawl fill — 84 / 128
          </p>
        </section>
      </div>
    </div>
  );
}
