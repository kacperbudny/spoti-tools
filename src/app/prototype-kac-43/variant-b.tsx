import { AudioLines } from "lucide-react";
import { Archivo, Big_Shoulders, JetBrains_Mono } from "next/font/google";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * PROTOTYPE variant B — "Signal". Flat true-black canvas with a vignette
 * (no grain), a condensed display paired with a technical mono for metadata,
 * sharp small radius, hairline borders, and sharp segmented toggle buttons
 * instead of switches. See variant-a/variant-c for the other directions and
 * page.tsx for the scope note.
 */

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--pt-b-display",
});

const body = Archivo({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pt-b-body",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pt-b-mono",
});

const vars = {
  "--pt-canvas": "oklch(0.09 0 0)",
  "--pt-canvas-raised": "oklch(0.14 0 0)",
  "--pt-fg": "oklch(0.97 0 0)",
  "--pt-fg-muted": "oklch(0.55 0 0)",
  "--pt-border": "oklch(1 0 0 / 12%)",
  "--pt-cta": "oklch(0.82 0.19 148)",
  "--pt-cta-fg": "oklch(0.08 0 0)",
  "--radius": "0.25rem",
  fontFamily: "var(--pt-b-body)",
} as CSSProperties;

const displayStyle = {
  fontFamily: "var(--pt-b-display)",
  letterSpacing: "0.02em",
} as CSSProperties;
const monoStyle = { fontFamily: "var(--pt-b-mono)" } as CSSProperties;
const ctaGlow = {
  background: "var(--pt-cta)",
  color: "var(--pt-cta-fg)",
  boxShadow: "0 0 24px color-mix(in oklch, var(--pt-cta), transparent 65%)",
} as CSSProperties;

const ALBUM_TYPE_LABELS = ["ALBUM", "SINGLE/EP", "COMPILATION"] as const;

function Eyebrow({
  index,
  children,
}: {
  index: string;
  children: React.ReactNode;
}) {
  return (
    <p
      className="text-[10px] uppercase tracking-[0.35em] text-[var(--pt-fg-muted)]"
      style={monoStyle}
    >
      › {index} {children}
    </p>
  );
}

export function VariantB() {
  return (
    <div
      className={cn(
        "dark relative min-h-screen w-full overflow-hidden",
        display.variable,
        body.variable,
        mono.variable,
      )}
      style={vars}
    >
      <div className="absolute inset-0 bg-[var(--pt-canvas)]" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col gap-16 px-6 py-16 pb-32 text-[var(--pt-fg)]">
        {/* 01 — Landing door */}
        <section className="flex flex-col gap-4">
          <Eyebrow index="01">LANDING DOOR</Eyebrow>
          <div className="border border-[var(--pt-border)]">
            <div className="flex items-center gap-1.5 border-b border-[var(--pt-border)] px-3 py-2">
              <span className="size-1.5 rounded-full bg-[var(--pt-fg-muted)]" />
              <span className="size-1.5 rounded-full bg-[var(--pt-fg-muted)]" />
              <span className="size-1.5 rounded-full bg-[var(--pt-fg-muted)]" />
              <span
                className="ml-2 text-[10px] uppercase tracking-widest text-[var(--pt-fg-muted)]"
                style={monoStyle}
              >
                spotitools
              </span>
            </div>
            <div className="flex flex-col items-center gap-4 px-8 py-16">
              <p className="text-3xl uppercase" style={displayStyle}>
                SpotiTools
              </p>
              <button
                type="button"
                className="px-7 py-3 text-sm font-medium uppercase tracking-wide"
                style={ctaGlow}
              >
                Sign-in with Spotify
              </button>
              <p
                role="alert"
                className="text-xs text-[var(--pt-fg-muted)]"
                style={monoStyle}
              >
                ERR: sign-in did not complete. retry.
              </p>
            </div>
          </div>
        </section>

        {/* 02 — Dashboard catalog */}
        <section className="flex flex-col gap-5">
          <Eyebrow index="02">DASHBOARD CATALOG</Eyebrow>
          <div className="flex items-center justify-between">
            <p className="text-lg uppercase" style={displayStyle}>
              Jordan
            </p>
            <button
              type="button"
              className="border border-[var(--pt-border)] px-4 py-1.5 text-[10px] uppercase tracking-widest"
              style={monoStyle}
            >
              Sign-out
            </button>
          </div>
          <div className="border border-[var(--pt-border)] bg-[var(--pt-canvas-raised)] p-5">
            <div className="flex items-center justify-between">
              <div className="flex size-9 items-center justify-center border border-[var(--pt-border)]">
                <AudioLines className="size-4" strokeWidth={2} />
              </div>
              <span
                className="text-[10px] text-[var(--pt-fg-muted)]"
                style={monoStyle}
              >
                TL·01
              </span>
            </div>
            <div className="mt-4 flex flex-col gap-1 border-t border-[var(--pt-border)] pt-4">
              <p className="text-base uppercase" style={displayStyle}>
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
          <Eyebrow index="03">RANDOM ALBUM · IDLE</Eyebrow>
          <p className="text-2xl uppercase" style={displayStyle}>
            Random album
          </p>
          <div className="grid grid-cols-3 gap-0 border border-[var(--pt-border)]">
            {ALBUM_TYPE_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                aria-pressed
                className={cn(
                  "px-2 py-3 text-[10px] uppercase tracking-wide",
                  i > 0 && "border-l border-[var(--pt-border)]",
                )}
                style={{
                  ...monoStyle,
                  background:
                    "color-mix(in oklch, var(--pt-cta), transparent 88%)",
                  color: "var(--pt-fg)",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="px-7 py-3 text-sm font-medium uppercase tracking-wide"
            style={ctaGlow}
          >
            Start
          </button>
        </section>

        {/* 04 — Random album, pick */}
        <section className="flex flex-col gap-4">
          <Eyebrow index="04">RANDOM ALBUM · PICK</Eyebrow>
          <div
            className="aspect-square w-full border border-[var(--pt-border)]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, oklch(0.16 0 0) 0px, oklch(0.16 0 0) 2px, oklch(0.11 0 0) 2px, oklch(0.11 0 0) 4px)",
            }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-xl uppercase" style={displayStyle}>
              In Rainbows
            </p>
            <p className="text-[var(--pt-fg-muted)]" style={monoStyle}>
              Radiohead
            </p>
            <p className="text-sm text-[var(--pt-fg-muted)]" style={monoStyle}>
              2007 · ALBUM
            </p>
          </div>
          <button
            type="button"
            className="px-7 py-3 text-sm font-medium uppercase tracking-wide"
            style={ctaGlow}
          >
            Listen on Spotify
          </button>
          <button
            type="button"
            className="border border-[var(--pt-border)] px-7 py-2.5 text-sm uppercase tracking-wide text-[var(--pt-fg-muted)]"
          >
            Re-shuffle
          </button>
        </section>

        {/* 05 — Green usage sampler */}
        <section className="flex flex-col gap-3">
          <Eyebrow index="05">GREEN USAGE SAMPLER</Eyebrow>
          <div className="h-1.5 w-full bg-[var(--pt-canvas-raised)]">
            <div
              className="h-full w-2/3"
              style={{
                background: "var(--pt-cta)",
                boxShadow:
                  "0 0 12px color-mix(in oklch, var(--pt-cta), transparent 60%)",
              }}
            />
          </div>
          <p className="text-xs text-[var(--pt-fg-muted)]" style={monoStyle}>
            crawl: 84/128
          </p>
        </section>
      </div>
    </div>
  );
}
