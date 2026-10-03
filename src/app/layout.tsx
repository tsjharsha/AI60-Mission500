import type { Metadata } from "next";
import "./globals.css";
import MissionHeader from "@/components/experience/MissionHeader";
import MissionFooter from "@/components/experience/MissionFooter";
export const metadata: Metadata = {
  title: {
    default: "AI60 — Build something you can demo",
    template: "%s | AI60",
  },
  description:
    "A free 60-minute AI workshop concept and transparent Mission 500 campaign simulation for the NxtWave growth challenge.",
  openGraph: {
    title: "AI60 — Leave with something you can demo",
    description:
      "Three practical project previews. One guided 60-minute build. Attend solo or bring a friend.",
    type: "website",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <MissionHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <MissionFooter />
      </body>
    </html>
  );
}
