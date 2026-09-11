import { Shuffle } from "lucide-react";
import { Instrument_Serif, Sora } from "next/font/google";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * PROTOTYPE variant C — "Velvet Room". A violet-tinted near-black canvas with
 * a soft gradient-mesh atmosphere (no grain), an italic serif display paired
 * with a soft geometric body, very large/pill radius, glow shadows, and a
 * pill-segmented Album type group. See variant-a/variant-b for the other
 * directions and page.tsx for the scope note.
 */

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--pt-c-display",
});

const body = Sora({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pt-c-body",
});

const vars = {
  "--pt-canvas": "oklch(0.15 0.02 290)",
  "--pt-canvas-raised": "oklch(0.2 0.028 285)",
  "--pt-fg": "oklch(0.95 0.01 285)",
  "--pt-fg-muted": "oklch(0.7 0.02 280)",
  "--pt-border": "oklch(1 0 0 / 10%)",
  "--pt-cta": "oklch(0.68 0.1 155)",
  "--pt-cta-fg": "oklch(0.15 0.02 155)",
  "--radius": "1.4rem",
  fontFamily: "var(--pt-c-body)",
} as CSSProperties;

const displayItalicStyle = {
  fontFamily: "var(--pt-c-display)",
  fontStyle: "italic",
} as CSSProperties;
const ctaGlow = {
  background: "var(--pt-cta)",
  color: "var(--pt-cta-fg)",
  boxShadow: "0 0 32px color-mix(in oklch, var(--pt-cta), transparent 65%)",
} as CSSProperties;

const ALBUM_TYPE_LABELS = ["Album", "Single/EP", "Compilation"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[var(--pt-fg-muted)]" style={displayItalicStyle}>
      {children}
    </p>
  );
}

export function VariantC() {
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
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, oklch(0.24 0.04 280 / 70%), transparent 70%), radial-gradient(50% 35% at 50% 100%, oklch(0.22 0.06 30 / 12%), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center gap-20 px-6 py-20 pb-32 text-center text-[var(--pt-fg)]">
        {/* 01 — Landing door */}
        <section className="flex w-full flex-col items-center gap-5">
          <Eyebrow>one — the landing door</Eyebrow>
          <div
            className="flex w-full flex-col items-center gap-4 rounded-[36px] px-8 py-16"
            style={{
              background: "var(--pt-canvas-raised)",
              boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)",
            }}
          >
            <p className="text-4xl italic" style={displayItalicStyle}>
              SpotiTools
            </p>
            <button
              type="button"
              className="rounded-full px-8 py-3 text-sm font-medium"
              style={ctaGlow}
            >
              Sign-in with Spotify
            </button>
            <p role="alert" className="text-xs text-[var(--pt-fg-muted)]">
              Sign-in did not complete. You can try again.
            </p>
          </div>
        </section>

        {/* 02 — Dashboard catalog */}
        <section className="flex w-full flex-col items-center gap-5">
          <Eyebrow>two — the dashboard catalog</Eyebrow>
          <div className="flex w-full items-center justify-between">
            <p className="text-lg italic" style={displayItalicStyle}>
              Jordan
            </p>
            <button
              type="button"
              className="rounded-full border border-[var(--pt-border)] px-4 py-1.5 text-xs"
            >
              Sign-out
            </button>
          </div>
          <div
            className="flex w-full flex-col items-center gap-3 rounded-[32px] px-6 py-8"
            style={{ background: "var(--pt-canvas-raised)" }}
          >
            <div className="relative flex size-12 items-center justify-center rounded-full bg-[var(--pt-canvas)] shadow-[0_10px_24px_-8px_rgba(0,0,0,0.6)]">
              <Shuffle className="size-5" strokeWidth={1.5} />
              <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-[var(--pt-canvas-raised)] bg-[var(--pt-cta)]" />
            </div>
            <p className="text-lg italic" style={displayItalicStyle}>
              Random album
            </p>
            <p className="text-sm text-[var(--pt-fg-muted)]">
              A random Album from your saved Library.
            </p>
          </div>
        </section>

        {/* 03 — Random album, idle */}
        <section className="flex w-full flex-col items-center gap-6">
          <Eyebrow>three — random album, idle</Eyebrow>
          <p className="text-3xl italic" style={displayItalicStyle}>
            Random album
          </p>
          <div
            className="flex w-full items-center justify-between gap-1 rounded-full p-1"
            style={{ background: "var(--pt-canvas-raised)" }}
          >
            {ALBUM_TYPE_LABELS.map((label, i) => (
              <span
                key={label}
                className="flex-1 rounded-full px-3 py-2 text-center text-xs"
                style={
                  i === 0
                    ? {
                        background:
                          "color-mix(in oklch, var(--pt-cta), transparent 78%)",
                        color: "var(--pt-fg)",
                      }
                    : { color: "var(--pt-fg-muted)" }
                }
              >
                {label}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="w-full rounded-full px-8 py-3.5 text-sm font-medium"
            style={ctaGlow}
          >
            Start
          </button>
        </section>

        {/* 04 — Random album, pick */}
        <section className="flex w-full flex-col items-center gap-5">
          <Eyebrow>four — random album, pick</Eyebrow>
          <div
            className="aspect-square w-full rounded-[32px]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 35% 25%, oklch(0.32 0.06 280), oklch(0.16 0.03 290))",
              boxShadow: "0 30px 50px -24px rgba(0,0,0,0.7)",
            }}
          />
          <div className="flex flex-col gap-1">
            <p className="text-2xl italic" style={displayItalicStyle}>
              In Rainbows
            </p>
            <p className="text-[var(--pt-fg-muted)]">Radiohead</p>
            <p className="text-sm text-[var(--pt-fg-muted)]">2007 · Album</p>
          </div>
          <button
            type="button"
            className="w-full rounded-full px-8 py-3.5 text-sm font-medium"
            style={ctaGlow}
          >
            Listen on Spotify
          </button>
          <button
            type="button"
            className="rounded-full px-8 py-2.5 text-sm text-[var(--pt-fg-muted)]"
          >
            Re-shuffle
          </button>
        </section>

        {/* 05 — Green usage sampler */}
        <section className="flex w-full flex-col items-center gap-3">
          <Eyebrow>five — green usage sampler</Eyebrow>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--pt-canvas-raised)]">
            <div
              className="h-full w-2/3 rounded-full"
              style={{
                background: "var(--pt-cta)",
                boxShadow:
                  "0 0 16px color-mix(in oklch, var(--pt-cta), transparent 55%)",
              }}
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
