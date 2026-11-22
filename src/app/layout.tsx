import type { Metadata, Viewport } from "next";
import "@fontsource/anton/400.css";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/800.css";
import "@fontsource/permanent-marker/400.css";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { MusicProvider, MusicToggle } from "@/components/music";
import { event } from "@/data/event";

const title = `${event.host.name}'s ${event.host.age}th — ${event.tourName}`;

export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title,
  description: "You're invited. One night only. Bring a burger topping.",
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description: "You're invited. One night only. Bring a burger topping.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="halftone min-h-full">
        <MusicProvider src={event.audio.music} volume={event.audio.musicVolume}>
          {children}
          <MusicToggle />
        </MusicProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
