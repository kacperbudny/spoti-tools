import type { Metadata, Viewport } from "next";
import { Fraunces, Geist_Mono, Karla } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { THEME_COLOR } from "@/lib/theme";
import { cn } from "@/lib/utils";

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpotiTools",
  description: "Spotify toolbox",
  appleWebApp: {
    capable: true,
    title: "SpotiTools",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "dark h-full antialiased font-sans",
        karla.variable,
        fraunces.variable,
        geistMono.variable,
      )}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
