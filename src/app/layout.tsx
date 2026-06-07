// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: { default: "زِيّ | zeyy", template: "%s | zeyy" },
  description: "الفخامة الهادئة — Quiet Luxury Apparel",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "zeyy" },
  openGraph: {
    title: "زِيّ | zeyy",
    description: "الفخامة الهادئة — Quiet Luxury Apparel",
    siteName: "zeyy",
    locale: "ar_EG",
    type: "website",
  },
  icons: {
    icon:     [{ url: "/assets/brand/favicon-32x32.png", sizes: "32x32" }],
    apple:    [{ url: "/assets/brand/icon-512.png" }],
    shortcut: [{ url: "/assets/brand/favicon-32x32.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E8DCCA" },
    { media: "(prefers-color-scheme: dark)",  color: "#1A2238" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="zeyy" />
        <link rel="apple-touch-icon" href="/assets/brand/icon-512.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
