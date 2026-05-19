"use client";
// src/app/page.tsx

import { useRef, useState, useEffect } from "react";
import { motion, useInView }  from "framer-motion";
import Link                   from "next/link";
import Navbar                 from "@/components/Navbar";
import Footer                 from "@/components/Footer";
import ProductCard            from "@/components/ProductCard";
import { useStore }           from "@/store/useStore";
import { useContent, useProducts } from "@/hooks/useFirestore";

function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}>
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const { lang }              = useStore();
  const [mounted, setMounted] = useState(false);
  const content               = useContent("home");
  const { products, loading } = useProducts();

  useEffect(() => { setMounted(true); }, []);

  // Use fixed defaults until mounted to avoid hydration mismatch
  const isAr       = mounted ? lang === "ar" : true;
  const featured   = products.filter((p: any) => p.featured).slice(0, 6);

  const heroTitle    = isAr ? (content.hero_title_ar    || "الأصالة في كل خيط")     : (content.hero_title_en    || "Authenticity in Every Thread");
  const heroSub      = isAr ? (content.hero_subtitle_ar || "أسلوب هادئ. جودة تتكلم.") : (content.hero_subtitle_en || "Quiet style. Quality speaks.");
  const heroCta      = isAr ? (content.hero_cta_ar      || "اكتشف المجموعة")         : (content.hero_cta_en      || "Explore");
  const featuredTitle= isAr ? (content.featured_title_ar|| "المجموعة الجديدة")        : (content.featured_title_en|| "New Collection");
  const aboutTeaser  = isAr ? (content.about_teaser_ar  || "مصنوع بهدوء، لمن يعرف قيمة التفاصيل.") : (content.about_teaser_en || "Crafted quietly, for those who notice.");
  const viewAll      = isAr ? "عرض الكل" : "View All";
  const newCol       = isAr ? "مجموعة جديدة" : "New Collection";
  const readMore     = isAr ? "اقرأ أكثر" : "Read more";

  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ─────────────────────────────────── */}
        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
          style={{ background: "#38040E" }}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.15)" }} />

          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto"
            style={{ color: "#E8DCCA" }}
            dir={isAr ? "rtl" : "ltr"}
            suppressHydrationWarning
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="text-xs uppercase mb-8"
              style={{ letterSpacing: "0.25em" }}
              suppressHydrationWarning
            >
              {newCol}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.5 }}
              style={{
                fontSize: "clamp(2.8rem, 8vw, 7rem)",
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontWeight: isAr ? 700 : 600,
                letterSpacing: isAr ? "0.02em" : "-0.025em",
                lineHeight: 1.05,
                marginBottom: "24px",
              }}
              suppressHydrationWarning
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 0.65, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                marginBottom: "40px",
                maxWidth: "420px",
                margin: "0 auto 40px",
                lineHeight: 1.7,
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
              }}
              suppressHydrationWarning
            >
              {heroSub}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              <Link href="/shop"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "14px 40px",
                  background: "#E8DCCA",
                  color: "#38040E",
                  fontSize: "12px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                  transition: "opacity 0.3s",
                }}
                suppressHydrationWarning
              >
                {heroCta}
              </Link>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.8 }}
            style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)" }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: "1px", height: "40px", background: "#E8DCCA" }}
            />
          </motion.div>
        </section>

        {/* ── Featured ─────────────────────────────── */}
        <section className="section-container py-24" dir={isAr ? "rtl" : "ltr"} suppressHydrationWarning>
          <RevealSection className="flex items-end justify-between mb-12">
            <div>
              <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0.4, marginBottom: "8px", color: "var(--color-text)" }}>
                {isAr ? "المختارات" : "Featured"}
              </p>
              <h2 style={{
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
                fontWeight: isAr ? 700 : 600,
                color: "var(--color-text)",
              }}>
                {featuredTitle}
              </h2>
            </div>
            <Link href="/shop"
              style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, color: "var(--color-text)", textDecoration: "none" }}>
              {viewAll} →
            </Link>
          </RevealSection>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse" style={{ background: "var(--color-border)" }} />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {featured.map((product: any, i: number) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] flex items-center justify-center"
                  style={{ background: "var(--color-border)", border: "1px solid var(--color-border)" }}>
                  <span style={{ fontSize: "11px", opacity: 0.2, letterSpacing: "0.1em" }}>Soon</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Brand Statement ───────────────────────── */}
        <section style={{ background: "#1A2238", padding: "7rem 0" }}>
          <div className="section-container" style={{ maxWidth: "700px", textAlign: "center" }}
            dir={isAr ? "rtl" : "ltr"} suppressHydrationWarning>
            <RevealSection>
              <p style={{
                fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontStyle: isAr ? "normal" : "italic",
                color: "#E8DCCA",
                opacity: 0.8,
                lineHeight: 1.7,
              }}>
                {aboutTeaser}
              </p>
              <Link href="/about"
                style={{ display: "inline-block", marginTop: "32px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "#E8DCCA", opacity: 0.4, textDecoration: "none" }}>
                {readMore} →
              </Link>
            </RevealSection>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
