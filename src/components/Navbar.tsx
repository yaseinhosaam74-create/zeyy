"use client";
// src/components/Navbar.tsx

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Sun, Moon, Globe, X, ChevronDown } from "lucide-react";
import { useStore } from "@/store/useStore";
import { useSections } from "@/hooks/useFirestore";
import CartDrawer from "@/components/CartDrawer";
import { onSnapshot, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Animated hamburger icon
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div style={{ width: "22px", height: "16px", position: "relative", cursor: "pointer" }}>
      <motion.span
        animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "1.5px", background: "currentColor", display: "block", transformOrigin: "center" }}
      />
      <motion.span
        animate={{ opacity: open ? 0 : 1, scaleX: open ? 0 : 1 }}
        transition={{ duration: 0.2 }}
        style={{ position: "absolute", top: "50%", left: 0, width: "100%", height: "1.5px", background: "currentColor", display: "block", marginTop: "-0.75px" }}
      />
      <motion.span
        animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "1.5px", background: "currentColor", display: "block", transformOrigin: "center" }}
      />
    </div>
  );
}

// Gender submenu item
function GenderSection({ gender, label, sections, isAr, onClose }: {
  gender: string; label: string; sections: any[]; isAr: boolean; onClose: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const filtered = sections.filter((s: any) => s.gender === gender || !s.gender);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 0",
          background: "none", borderTop: "none", borderLeft: "none", borderRight: "none", borderBottom: "1px solid var(--color-border)",
          cursor: "pointer", color: "var(--color-text)",
        } as any}
      >
        <Link href={`/shop?gender=${gender}`} onClick={onClose}
          style={{ fontSize: "16px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)", textDecoration: "none" }}>
          {label}
        </Link>
        {filtered.length > 0 && (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} style={{ color: "var(--color-text)", opacity: 0.4 }} />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {expanded && filtered.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ paddingBottom: "8px" }}>
              {filtered.map((s: any) => (
                <Link key={s.id} href={`/shop?gender=${gender}&category=${s.slug}`} onClick={onClose}
                  style={{ display: "block", padding: "8px 16px", fontSize: "13px", color: "var(--color-text)", opacity: 0.55, textDecoration: "none", fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit", borderBottom: "1px solid var(--color-border)", transition: "opacity 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "0.55")}>
                  {isAr ? s.name_ar : s.name_en}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const [isDark,     setIsDark]     = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [sections,   setSections]   = useState<any[]>([]);
  const { lang, setLang, cartCount, setCartOpen } = useStore();
  const isAr = lang === "ar";

  useEffect(() => {
    setMounted(true);
    const check = () => setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Load sections from Firestore
    const unsub = onSnapshot(collection(db, "sections"), snap => {
      const data: any[] = [];
      snap.forEach(d => {
        const s = d.data();
        if (s.visible) data.push({ id: d.id, ...s });
      });
      setSections(data.sort((a, b) => a.order - b.order));
    });

    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      obs.disconnect();
      unsub();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  function toggleTheme() {
    if (typeof window !== "undefined" && (window as any).zeyyToggleTheme) {
      (window as any).zeyyToggleTheme();
    }
  }

  const textColor = scrolled ? "var(--color-text)" : "#E8DCCA";
  const bgColor   = scrolled ? "var(--color-bg)"   : "transparent";

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ background: bgColor, backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid var(--color-border)" : "1px solid transparent" }}
      >
        <div className="section-container flex items-center justify-between h-[72px]">

          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <span style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "1.6rem", color: textColor, transition: "opacity 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
              {isAr ? "زِيّ" : "zeyy"}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { href: "/shop",              ar: "المتجر",  en: "Shop"    },
              { href: "/shop?gender=men",   ar: "رجالي",   en: "Men"     },
              { href: "/shop?gender=women", ar: "حريمي",   en: "Women"   },
              { href: "/about",             ar: "من نحن",  en: "About"   },
              { href: "/contact",           ar: "تواصل",   en: "Contact" },
            ].map(item => (
              <Link key={item.href} href={item.href}
                style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: textColor, textDecoration: "none", opacity: 0.85, transition: "opacity 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.5")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.85")}>
                {isAr ? item.ar : item.en}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Lang */}
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              style={{ fontSize: "11px", letterSpacing: "0.08em", color: textColor, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", opacity: 0.7 }}>
              <Globe size={14} strokeWidth={1.5} />
              <span className="hidden sm:block">{lang === "ar" ? "EN" : "عر"}</span>
            </button>

            {/* Theme */}
            {mounted && (
              <button onClick={toggleTheme} style={{ color: textColor, background: "none", border: "none", cursor: "pointer", opacity: 0.7, display: "flex" }}>
                {isDark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
              </button>
            )}

            {/* Cart */}
            <button onClick={() => setCartOpen(true)} style={{ position: "relative", color: textColor, background: "none", border: "none", cursor: "pointer", opacity: 0.85, display: "flex" }}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount() > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                  style={{ position: "absolute", top: "-6px", right: "-6px", width: "16px", height: "16px", borderRadius: "50%", background: "#E8DCCA", color: "#38040E", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                  {cartCount()}
                </motion.span>
              )}
            </button>

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ color: textColor, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}
              aria-label="Menu"
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile/Full Menu ───────────────────────────────── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)" }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: isAr ? "-100%" : "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isAr ? "-100%" : "100%", opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: "fixed", top: 0, bottom: 0, zIndex: 50,
                width: "min(300px, 85vw)",
                [isAr ? "left" : "right"]: 0,
                background: "var(--color-bg)",
                display: "flex", flexDirection: "column",
                boxShadow: isAr ? "6px 0 30px rgba(0,0,0,0.15)" : "-6px 0 30px rgba(0,0,0,0.15)",
              }}
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid var(--color-border)" }}
              >
                <Link href="/" onClick={() => setMenuOpen(false)}
                  style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "1.5rem", color: "var(--color-text)", textDecoration: "none" }}>
                  {isAr ? "زِيّ" : "zeyy"}
                </Link>
                <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.4, display: "flex" }}>
                  <X size={18} strokeWidth={1.5} />
                </button>
              </motion.div>

              {/* Nav links */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>

                {/* ── Main pages ── */}
                <motion.div initial={{ opacity: 0, x: isAr ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.3 }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.3, marginBottom: "10px" }}>
                    {isAr ? "الصفحات" : "Pages"}
                  </p>
                </motion.div>

                {[
                  { href: "/",        ar: "الرئيسية",       en: "Home",    delay: 0.13 },
                  { href: "/about",   ar: "من نحن",          en: "About",   delay: 0.15 },
                  { href: "/contact", ar: "تواصل معنا",      en: "Contact", delay: 0.17 },
                  { href: "/account", ar: "حسابي",           en: "Account", delay: 0.19 },
                  { href: "/orders",  ar: "طلباتي",          en: "Orders",  delay: 0.21 },
                ].map(item => (
                  <motion.div key={item.href} initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: item.delay, duration: 0.3 }}>
                    <Link href={item.href} onClick={() => setMenuOpen(false)}
                      style={{ display: "block", padding: "12px 0", fontSize: "15px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)", textDecoration: "none", borderBottom: "1px solid var(--color-border)", transition: "opacity 0.2s" }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.6")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                      {isAr ? item.ar : item.en}
                    </Link>
                  </motion.div>
                ))}

                {/* ── Shop sections ── */}
                <motion.div initial={{ opacity: 0, x: isAr ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.24, duration: 0.3 }}>
                  <p style={{ fontSize: "9px", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.3, marginTop: "20px", marginBottom: "10px" }}>
                    {isAr ? "تسوق" : "Shop"}
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.26, duration: 0.3 }}>
                  <GenderSection gender="men"   label={isAr ? "رجالي" : "Men"}   sections={sections} isAr={isAr} onClose={() => setMenuOpen(false)} />
                </motion.div>
                <motion.div initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.28, duration: 0.3 }}>
                  <GenderSection gender="women" label={isAr ? "حريمي" : "Women"} sections={sections} isAr={isAr} onClose={() => setMenuOpen(false)} />
                </motion.div>

                {/* Offers */}
                <motion.div initial={{ opacity: 0, x: isAr ? -12 : 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.30, duration: 0.3 }}>
                  <Link href="/shop?has_offer=true" onClick={() => setMenuOpen(false)}
                    style={{ display: "block", padding: "14px 0", fontSize: "15px", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "#38040E", textDecoration: "none", borderBottom: "1px solid var(--color-border)", fontWeight: 600 }}>
                    {isAr ? "🏷️ العروض" : "🏷️ Offers"}
                  </Link>
                </motion.div>
              </div>

              {/* Bottom */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                style={{ padding: "16px 24px", borderTop: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: "20px" }}
              >
                <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.5, background: "none", border: "none", cursor: "pointer" }}>
                  <Globe size={14} /> {lang === "ar" ? "EN" : "عر"}
                </button>
                {mounted && (
                  <button onClick={toggleTheme} style={{ color: "var(--color-text)", opacity: 0.5, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
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
