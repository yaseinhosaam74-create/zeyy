// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers }      from "@/components/Providers";
import { PageLoader }     from "@/components/animations/PageLoader";
import { PageTransition } from "@/components/animations/PageTransition";
import { CustomCursor }   from "@/components/animations/CustomCursor";
import { LenisInit }      from "@/components/animations/LenisInit";

export const metadata: Metadata = {
  title:       { default: "زِيّ | zeyy", template: "%s | zeyy" },
  description: "الفخامة الهادئة — Quiet Luxury Apparel",
  manifest:    "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "zeyy" },
  icons: {
    icon:    [{ url: "/assets/brand/favicon-32x32.png", sizes: "32x32" }],
    apple:   [{ url: "/assets/brand/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#38040E" },
    { media: "(prefers-color-scheme: dark)",  color: "#1A2238" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable"           content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title"            content="zeyy" />
        <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <PageLoader />
          <CustomCursor />
          <LenisInit />
          <PageTransition>
            {children}
          </PageTransition>
        </Providers>
      </body>
    </html>
  );
}
