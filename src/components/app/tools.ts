import { Disc3, ListMusic } from "lucide-react";

export const TOOLS = [
  {
    href: "/app/random-album",
    name: "Random album",
    description: "A random album from your saved library.",
    icon: Disc3,
  },
  {
    href: "/app/artist-playlist",
    name: "Artist playlist",
    description: "Save an artist's discography to a private playlist.",
    icon: ListMusic,
  },
] as const;

export const DASHBOARD_HREF = "/app";
