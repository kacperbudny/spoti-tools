import { Disc3 } from "lucide-react";

export const TOOL_DESTINATIONS = [
  {
    href: "/app/random-album",
    name: "Random album",
    explanation: "A random Album from your saved Library.",
  },
] as const;

export const DASHBOARD_HREF = "/app";

export const TOOL_ICONS = {
  "/app/random-album": Disc3,
} as const;
