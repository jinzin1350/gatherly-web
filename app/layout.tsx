import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gatherly — Beautiful Event Pages in Seconds",
  description:
    "Create a stunning, AI-designed event page in seconds. Collect memories from every guest automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
