import { mock } from "bun:test";
import { createElement, type ReactNode } from "react";

mock.module("next/link", () => ({
  default({ href, children, ...props }: { href: string; children: ReactNode }) {
    return createElement("a", { href, ...props }, children);
  },
}));
