"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useContent, useSocial } from "@/hooks/useFirestore";

const SOCIAL_DATA: Record<string, { icon: React.ReactNode; label: string }> = {
  instagram: { label: "Instagram", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
  tiktok:    { label: "TikTok",    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.33 6.34V8.69a8.21 8.21 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/></svg> },
  snapchat:  { label: "Snapchat",  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.74 2 6.5 4.58 6.5 7.5v.64c-.42.1-.85.2-1.28.3-.28.07-.5.28-.55.57-.05.28.07.57.3.73.53.37 1.2.59 1.89.65-.2.4-.48.74-.83.97-.1.07-.16.18-.16.3 0 .24.2.44.44.44h.08c.48-.07.95-.2 1.4-.37.26.84.87 2.77 3.21 2.77s2.95-1.93 3.21-2.77c.45.17.92.3 1.4.37h.08c.24 0 .44-.2.44-.44 0-.12-.06-.23-.16-.3-.35-.23-.63-.57-.83-.97.69-.06 1.36-.28 1.89-.65.23-.16.35-.45.3-.73-.05-.29-.27-.5-.55-.57-.43-.1-.86-.2-1.28-.3V7.5C17.5 4.58 15.26 2 12 2z"/></svg> },
  twitter:   { label: "X / Twitter", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
};

function SocialIcon({ platform, url }: { platform: string; url: string }) {
  const [hovered, setHovered] = useState(false);
  const data = SOCIAL_DATA[platform];
  if (!data) return null;
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <a href={url} target="_blank" rel="noopener noreferrer"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", color: "#E8DCCA", background: hovered ? "rgba(232,220,202,0.15)" : "transparent", border: "1px solid rgba(232,220,202,0.2)", transition: "all 0.3s", transform: hovered ? "translateY(-2px)" : "translateY(0)" }}>
        {data.icon}
      </a>
      {hovered && (
        <div style={{ position: "absolute", bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)", padding: "3px 8px", background: "rgba(232,220,202,0.95)", color: "#38040E", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", pointerEvents: "none" }}>
          {data.label}
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { lang }        = useStore();
  const [mounted, setMounted] = useState(false);
  const content         = useContent("footer");
  const social          = useSocial();
  const year            = new Date().getFullYear();

  useEffect(() => { setMounted(true); }, []);

  const isAr = mounted ? lang === "ar" : true;

  const shopLinks = [
    { href: "/shop",              ar: "كل المنتجات", en: "All Products" },
    { href: "/shop?gender=men",   ar: "رجالي",        en: "Men"          },
    { href: "/shop?gender=women", ar: "حريمي",        en: "Women"        },
    { href: "/shop?category=limited", ar: "إصدار محدود", en: "Limited Ed." },
  ];
  const helpLinks = [
    { href: "/about",   ar: "من نحن",         en: "About"   },
    { href: "/contact", ar: "تواصل معنا",      en: "Contact" },
    { href: "/account", ar: "حسابي",           en: "Account" },
    { href: "/terms",   ar: "الشروط",          en: "Terms"   },
    { href: "/privacy", ar: "الخصوصية",        en: "Privacy" },
  ];

  const visibleSocial = social
    ? Object.entries(social).filter(([, v]: any) => v.visible && v.url).sort(([, a]: any, [, b]: any) => a.order - b.order)
    : [];

  return (
    <footer dir={isAr ? "rtl" : "ltr"} style={{ marginTop: "6rem" }} suppressHydrationWarning>
      <div style={{ background: "#38040E", padding: "56px 0 40px" }}>
        <div className="section-container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "40px", marginBottom: "40px" }}>
            <div>
              <h2 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "2.2rem", color: "#E8DCCA", marginBottom: "8px" }} suppressHydrationWarning>
                {isAr ? "زِيّ" : "zeyy"}
              </h2>
              <p style={{ fontSize: "13px", color: "#E8DCCA", opacity: 0.5, lineHeight: 1.7, marginBottom: "20px" }}>
                {isAr ? (content.tagline_ar || "زِيّ — الفخامة الهادئة") : (content.tagline_en || "zeyy — Quiet Luxury")}
              </p>
              {visibleSocial.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {visibleSocial.map(([key, v]: any) => <SocialIcon key={key} platform={key} url={v.url} />)}
                </div>
              )}
            </div>
            <div suppressHydrationWarning>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#E8DCCA", opacity: 0.35, marginBottom: "16px" }}>
                {isAr ? "تسوق" : "Shop"}
              </p>
              {shopLinks.map(l => (
                <div key={l.href} style={{ marginBottom: "10px" }}>
                  <Link href={l.href} style={{ fontSize: "13px", color: "#E8DCCA", opacity: 0.65, textDecoration: "none" }} suppressHydrationWarning>
                    {isAr ? l.ar : l.en}
                  </Link>
                </div>
              ))}
            </div>
            <div suppressHydrationWarning>
              <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#E8DCCA", opacity: 0.35, marginBottom: "16px" }}>
                {isAr ? "مساعدة" : "Help"}
              </p>
              {helpLinks.map(l => (
                <div key={l.href} style={{ marginBottom: "10px" }}>
                  <Link href={l.href} style={{ fontSize: "13px", color: "#E8DCCA", opacity: 0.65, textDecoration: "none" }} suppressHydrationWarning>
                    {isAr ? l.ar : l.en}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(232,220,202,0.12)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }} suppressHydrationWarning>
            <p style={{ fontSize: "11px", color: "#E8DCCA", opacity: 0.25 }}>
              © {year} zeyy — {isAr ? (content.rights_ar || "جميع الحقوق محفوظة") : (content.rights_en || "All rights reserved")}
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <Link href="/terms"   style={{ fontSize: "11px", color: "#E8DCCA", opacity: 0.25, textDecoration: "none" }}>{isAr ? "الشروط"    : "Terms"  }</Link>
              <Link href="/privacy" style={{ fontSize: "11px", color: "#E8DCCA", opacity: 0.25, textDecoration: "none" }}>{isAr ? "الخصوصية" : "Privacy"}</Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "#0f1117", padding: "8px 0", textAlign: "center" }}>
        <p style={{ fontSize: "10px", color: "#E8DCCA", opacity: 0.15, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {isAr ? "صُنع بهدوء" : "Crafted quietly"}
        </p>
      </div>
    </footer>
  );
}
