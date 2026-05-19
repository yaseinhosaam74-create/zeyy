"use client";
// src/app/about/page.tsx

import { motion, useInView } from "framer-motion";
import { useRef }            from "react";
import Navbar                from "@/components/Navbar";
import Footer                from "@/components/Footer";
import { useStore }          from "@/store/useStore";
import { useContent }        from "@/hooks/useFirestore";
import Link                  from "next/link";

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const { lang, t } = useStore();
  const content     = useContent("about");
  const isAr        = lang === "ar";

  return (
    <>
      <Navbar />
      <main className="pt-[72px]" dir={isAr ? "rtl" : "ltr"}>

        {/* Hero */}
        <section
          className="min-h-[60vh] flex items-center justify-center text-center"
          style={{ background: "var(--brand-hero-red)", color: "#E8DCCA" }}
        >
          <div className="section-container max-w-2xl">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 0.8 }}
              className="text-xs tracking-[0.25em] uppercase mb-6"
            >
              {t("قصتنا", "Our Story")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              style={{
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                fontWeight: isAr ? 700 : 600,
                letterSpacing: isAr ? "0.02em" : "-0.02em",
              }}
            >
              {isAr ? (content.title_ar || "قصتنا") : (content.title_en || "Our Story")}
            </motion.h1>
          </div>
        </section>

        {/* Body */}
        <section className="section-container max-w-3xl py-24">
          <Reveal>
            <p
              className="text-lg sm:text-xl leading-loose opacity-75 mb-12"
              style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}
            >
              {isAr
                ? (content.body_ar || "زِيّ ليست مجرد ملابس، هي موقف. نصنع قطعاً تعيش معك.")
                : (content.body_en || "zeyy is not just clothing, it's an attitude. We craft pieces that live with you.")}
            </p>
          </Reveal>

          <div className="w-full h-px mb-12" style={{ background: "var(--color-border)" }} />

          {/* Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { ar: "الجودة",   en: "Quality",   desc_ar: "كل خيط بحكمة",            desc_en: "Every thread with intention"    },
              { ar: "الهدوء",   en: "Calm",      desc_ar: "فخامة بدون ضجيج",         desc_en: "Luxury without noise"           },
              { ar: "الأصالة",  en: "Authenticity", desc_ar: "لمن يعرف الفرق",       desc_en: "For those who know the difference" },
            ].map((v, i) => (
              <Reveal key={v.en} delay={i * 0.15}>
                <div>
                  <h3
                    className="text-xl mb-2 font-semibold"
                    style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}
                  >
                    {isAr ? v.ar : v.en}
                  </h3>
                  <p className="text-sm opacity-50 leading-relaxed">
                    {isAr ? v.desc_ar : v.desc_en}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-20 text-center"
          style={{ background: "var(--brand-midnight)", color: "#E8DCCA" }}
        >
          <Reveal>
            <p
              className="text-2xl sm:text-3xl mb-8 opacity-80"
              style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontStyle: isAr ? "normal" : "italic" }}
            >
              {t("مصنوع بهدوء، لمن يعرف قيمة التفاصيل.", "Crafted quietly, for those who notice.")}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-10 py-4 text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
              style={{ background: "#E8DCCA", color: "#38040E", letterSpacing: "0.15em" }}
            >
              {t("تسوق الآن", "Shop Now")}
            </Link>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
