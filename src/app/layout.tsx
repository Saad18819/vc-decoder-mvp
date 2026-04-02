import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Term Sheet Decoder | VC Clause Intelligence",
  description:
    "Decode liquidation preference, anti-dilution, and other VC terms. Risk scoring, verdicts, and negotiation tips for founders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.variable,
          "theme min-h-screen font-sans text-foreground antialiased"
        )}
      >
        <div
          className="pointer-events-none fixed inset-0 -z-10 bg-[#08080A]"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-15%,rgba(59,130,246,0.14),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_30%,rgba(16,185,129,0.07),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_0%_80%,rgba(239,68,68,0.05),transparent_45%)]" />
          <div className="absolute inset-0 bg-elevated-dots opacity-[0.35]" />
        </div>
        {children}
      </body>
    </html>
  );
}
