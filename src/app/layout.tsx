import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const description =
  "Kitap sohbetlerini yeniden buluşturan topluluk uygulaması — kulüpler, etkinlikler, Akademi, blog ve 'ne okuyorum' akışı.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: "Kitapmeetup", template: "%s · Kitapmeetup" },
  description,
  keywords: [
    "kitap kulübü",
    "kitap sohbeti",
    "okuma topluluğu",
    "kitap etkinlikleri",
    "felsefe kulübü",
    "bilimkurgu kulübü",
    "kitapmeetup",
  ],
  applicationName: "Kitapmeetup",
  authors: [{ name: "Kitapmeetup" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Kitapmeetup",
    title: "Kitapmeetup",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitapmeetup",
    description,
  },
  // Favicon (icon.tsx), apple-touch-icon (apple-icon.tsx), OG görseli
  // (opengraph-image.tsx) ve manifest (manifest.ts) Next'in dosya
  // tabanlı metadata kuralları sayesinde otomatik bağlanır — burada
  // tekrar tanımlamaya gerek yok.
};

export const viewport: Viewport = {
  themeColor: "#f0611f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-[var(--paper)] text-[var(--ink)] antialiased">{children}</body>
    </html>
  );
}
