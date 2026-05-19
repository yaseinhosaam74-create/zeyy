"use client";
// src/components/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sun, Moon, Menu, X, Globe, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useSections } from "@/hooks/useFirestore";
import CartDrawer from "@/components/CartDrawer";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const [isDark,   setIsDark]   = useState(false);
  const { lang, setLang, t, cartCount, setCartOpen, menuOpen, setMenuOpen } = useStore();
  const { visible: sections } = useSections();

  useEffect(() => {
    setMounted(true);
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    if (typeof window !== "undefined" && (window as any).zeyyToggleTheme) {
      (window as any).zeyyToggleTheme();
    }
  }

  const isAr      = lang === "ar";
  const textColor = scrolled ? "var(--color-text)" : "#E8DCCA";
  const bgColor   = scrolled ? "var(--color-bg)"   : "transparent";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background:     bgColor,
          borderBottom:   scrolled ? "1px solid var(--color-border)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
        }}
      >
        <div className="section-container flex items-center justify-between h-[72px]">
          <Link href="/">
            <span className="text-2xl md:text-3xl transition-all hover:opacity-70"
              style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, color: textColor }}>
              {isAr ? "زِيّ" : "zeyy"}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {[
              { href: "/shop",              ar: "المتجر",  en: "Shop"    },
              { href: "/shop?gender=men",   ar: "رجالي",   en: "Men"     },
              { href: "/shop?gender=women", ar: "حريمي",   en: "Women"   },
              { href: "/about",             ar: "من نحن",  en: "About"   },
              { href: "/contact",           ar: "تواصل",   en: "Contact" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
                style={{ color: textColor, letterSpacing: "0.12em", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}>
                {isAr ? item.ar : item.en}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1 text-xs uppercase transition-opacity hover:opacity-60"
              style={{ color: textColor }}>
              <Globe size={14} strokeWidth={1.5} />
              <span className="hidden sm:block">{lang === "ar" ? "EN" : "عر"}</span>
            </button>

            {mounted && (
              <button onClick={toggleTheme} className="transition-opacity hover:opacity-60" style={{ color: textColor }}>
                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>
            )}

            <button onClick={() => setCartOpen(true)} className="relative transition-opacity hover:opacity-60" style={{ color: textColor }}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount() > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center text-[10px] rounded-full"
                  style={{ background: "#E8DCCA", color: "#38040E" }}>
                  {cartCount()}
                </motion.span>
              )}
            </button>

            <button className="md:hidden transition-opacity hover:opacity-60"
              onClick={() => setMenuOpen(!menuOpen)} style={{ color: textColor }}>
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Menu with animation ─────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: isAr ? "-100%" : "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isAr ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed top-0 bottom-0 z-50 flex flex-col"
              style={{
                width: "280px",
                [isAr ? "left" : "right"]: 0,
                background: "var(--color-bg)",
                boxShadow: isAr ? "4px 0 24px rgba(0,0,0,0.2)" : "-4px 0 24px rgba(0,0,0,0.2)",
              }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "1.6rem", color: "var(--color-text)" }}>
                  {isAr ? "زِيّ" : "zeyy"}
                </span>
                <button onClick={() => setMenuOpen(false)}
                  className="opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-text)", background: "none", border: "none", cursor: "pointer" }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </motion.div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto py-4 px-6">

                {/* Shop section */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.3 }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.3, marginBottom: "8px", marginTop: "4px" }}>
                    {isAr ? "تسوق" : "Shop"}
                  </p>
                </motion.div>

                {[
                  { href: "/shop",              ar: "كل المنتجات", en: "All Products", delay: 0.14 },
                  { href: "/shop?gender=men",   ar: "رجالي",       en: "Men",          delay: 0.16 },
                  { href: "/shop?gender=women", ar: "حريمي",       en: "Women",        delay: 0.18 },
                ].map((item) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: item.delay, duration: 0.3 }}>
                    <Link href={item.href} onClick={() => setMenuOpen(false)}
                      className="block py-3.5 border-b transition-opacity hover:opacity-60"
                      style={{ color: "var(--color-text)", borderColor: "var(--color-border)", fontSize: "15px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", letterSpacing: "0.02em" }}>
                      {isAr ? item.ar : item.en}
                    </Link>
                  </motion.div>
                ))}

                {/* Dynamic sections */}
                {sections.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.20 + i * 0.04, duration: 0.3 }}>
                    <Link href={`/shop?category=${s.slug}`} onClick={() => setMenuOpen(false)}
                      className="block py-3 border-b transition-opacity hover:opacity-60"
                      style={{ color: "var(--color-text)", borderColor: "var(--color-border)", opacity: 0.65, fontSize: "14px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}>
                      {isAr ? s.name_ar : s.name_en}
                    </Link>
                  </motion.div>
                ))}

                {/* Links section */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.3 }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.3, marginBottom: "8px", marginTop: "20px" }}>
                    {isAr ? "روابط" : "Links"}
                  </p>
                </motion.div>

                {[
                  { href: "/about",   ar: "من نحن",          en: "About",   delay: 0.34 },
                  { href: "/contact", ar: "تواصل معنا",       en: "Contact", delay: 0.36 },
                  { href: "/account", ar: "حسابي",            en: "Account", delay: 0.38 },
                  { href: "/orders",  ar: "طلباتي",           en: "Orders",  delay: 0.40 },
                  { href: "/terms",   ar: "الشروط والأحكام",  en: "Terms",   delay: 0.42 },
                  { href: "/privacy", ar: "سياسة الخصوصية",  en: "Privacy", delay: 0.44 },
                ].map((item) => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: item.delay, duration: 0.3 }}>
                    <Link href={item.href} onClick={() => setMenuOpen(false)}
                      className="block py-3.5 border-b transition-opacity hover:opacity-60"
                      style={{ color: "var(--color-text)", borderColor: "var(--color-border)", fontSize: "15px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", letterSpacing: "0.02em" }}>
                      {isAr ? item.ar : item.en}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.3 }}
                className="px-6 py-4 flex items-center gap-5"
                style={{ borderTop: "1px solid var(--color-border)" }}
              >
                <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                  className="flex items-center gap-2 text-xs uppercase opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--color-text)", background: "none", border: "none", cursor: "pointer" }}>
                  <Globe size={14} /> {lang === "ar" ? "EN" : "عر"}
                </button>
                {mounted && (
                  <button onClick={toggleTheme}
                    className="opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--color-text)", background: "none", border: "none", cursor: "pointer" }}>
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
