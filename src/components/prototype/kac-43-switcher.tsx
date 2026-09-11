"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

/**
 * PROTOTYPE-ONLY infrastructure for KAC-43 (visual session for the late-night
 * look). Not part of any variant being evaluated — deliberately styled to
 * clash with all three so it reads as scaffolding. See
 * .agents/skills/prototype/UI.md for the pattern this implements.
 */

type PrototypeVariant = {
  key: string;
  name: string;
};

type PrototypeSwitcherProps = {
  variants: readonly PrototypeVariant[];
  current: string;
};

export function PrototypeSwitcher({
  variants,
  current,
}: PrototypeSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const index = Math.max(
    0,
    variants.findIndex((variant) => variant.key === current),
  );

  const go = useCallback(
    (delta: number) => {
      const nextIndex = (index + delta + variants.length) % variants.length;
      const params = new URLSearchParams(searchParams.toString());
      params.set("variant", variants[nextIndex].key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [index, variants, searchParams, pathname, router],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) {
        return;
      }
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  const active = variants[index];

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border border-fuchsia-400/50 bg-black px-3 py-2 font-mono text-xs text-fuchsia-200 shadow-[0_0_0_1px_rgba(255,0,200,0.25),0_8px_30px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous variant"
          className="rounded-full p-1 hover:bg-fuchsia-400/20"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="whitespace-nowrap">
          KAC-43 · {active.key} — {active.name}
        </span>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next variant"
          className="rounded-full p-1 hover:bg-fuchsia-400/20"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
