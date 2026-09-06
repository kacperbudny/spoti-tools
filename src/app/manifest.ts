import type { MetadataRoute } from "next";

// Mirrors --background in globals.css (oklch(1 0 0)); keep in sync with the
// viewport themeColor in layout.tsx.
const BACKGROUND_COLOR = "#ffffff";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpotiTools",
    short_name: "SpotiTools",
    description: "Spotify toolbox",
    // Installed entry is the Dashboard; the auth gate sends Visitors to the Landing.
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: BACKGROUND_COLOR,
    theme_color: BACKGROUND_COLOR,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
