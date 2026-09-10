import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "@/app/globals.css";
import { Providers } from "@/app/providers";
import { THEME_COLOR } from "@/lib/theme";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
