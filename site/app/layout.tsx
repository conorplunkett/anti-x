import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anti-Timeline — Use X intentionally",
  description:
    "A free Chrome extension that blocks the Home timeline, For You feed, Trends, and suggestions on Twitter/X while keeping posting, search, DMs, and everything useful working. No tracking, ever.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
