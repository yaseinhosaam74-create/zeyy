"use client";
// src/app/shop/page.tsx

import { useState, useEffect }  from "react";
import { useSearchParams }      from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Navbar         from "@/components/Navbar";
import Footer         from "@/components/Footer";
import ProductCard    from "@/components/ProductCard";
import { useStore }   from "@/store/useStore";
import { useProducts, useSections } from "@/hooks/useFirestore";

// Fixed subcategories shown under Men / Women
const SUBCATEGORIES = [
  { slug: "hoodies",    ar: "الهوديز",      en: "Hoodies"    },
  { slug: "tshirts",    ar: "التيشيرتات",   en: "T-Shirts"   },
  { slug: "sweatpants", ar: "السويت بانتس", en: "Sweatpants" },
  { slug: "basics",     ar: "البيزك",       en: "Basics"     },
  { slug: "limited",    ar: "إصدار محدود",  en: "Limited Ed."},
];

const SORT_OPTIONS = [
  { id: "newest",     ar: "الأحدث",   en: "Newest"   },
  { id: "price_asc",  ar: "السعر ↑",  en: "Price ↑" },
  { id: "price_desc", ar: "السعر ↓",  en: "Price ↓" },
];

export default function ShopPage() {
  const { lang, t }        = useStore();
  const searchParams       = useSearchParams();
  const isAr               = lang === "ar";

  const [gender,   setGender]   = useState(searchParams.get("gender") || "all");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [sort,     setSort]     = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const { products, loading } = useProducts();
  const { visible: sections } = useSections();

  useEffect(() => {
    const g = searchParams.get("gender");
    const c = searchParams.get("category");
    if (g) setGender(g);
    if (c) setCategory(c);
  }, [searchParams]);

  const filtered = products
    .filter((p: any) => gender === "all" || p.gender === gender || p.gender === "unisex")
    .filter((p: any) => category === "all" || p.category === category)
    .sort((a: any, b: any) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const currentSort = SORT_OPTIONS.find((o) => o.id === sort);

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen" dir={isAr ? "rtl" : "ltr"}>

        {/* ── Page Header ─────────────────────────────── */}
        <div style={{ background: "#38040E", color: "#E8DCCA", padding: "56px 0 40px", textAlign: "center" }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.6 }}
            style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
            {t("تسوق الآن", "Shop Now")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: isAr ? 700 : 600 }}>
            {gender === "men"   ? t("رجالي", "Men")
             : gender === "women" ? t("حريمي", "Women")
             : t("المجموعة الكاملة", "Full Collection")}
          </motion.h1>
        </div>

        {/* ── Gender Tabs ──────────────────────────────── */}
        <div style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
          <div className="section-container" style={{ display: "flex" }}>
            {[
              { id: "all",   ar: "الكل",   en: "All"   },
              { id: "men",   ar: "رجالي",  en: "Men"   },
              { id: "women", ar: "حريمي",  en: "Women" },
            ].map((g) => (
              <button key={g.id} onClick={() => { setGender(g.id); setCategory("all"); }}
                style={{
                  padding: "16px 24px",
                  fontSize: "12px",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-text)",
                  borderBottom: gender === g.id ? "2px solid var(--color-text)" : "2px solid transparent",
                  opacity: gender === g.id ? 1 : 0.4,
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                }}>
                {isAr ? g.ar : g.en}
              </button>
            ))}
          </div>
        </div>

        {/* ── Subcategory Filter ───────────────────────── */}
        {gender !== "all" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: "var(--color-bg)", borderBottom: "1px solid var(--color-border)", padding: "12px 0" }}
          >
            <div className="section-container" style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => setCategory("all")}
                style={{
                  padding: "6px 16px",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: category === "all" ? "var(--color-text)" : "transparent",
                  color: category === "all" ? "var(--color-bg)" : "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                {t("الكل", "All")}
              </button>
              {SUBCATEGORIES.map((sub) => (
                <button key={sub.slug}
                  onClick={() => setCategory(sub.slug)}
                  style={{
                    padding: "6px 16px",
                    fontSize: "11px",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    background: category === sub.slug ? "var(--color-text)" : "transparent",
                    color: category === sub.slug ? "var(--color-bg)" : "var(--color-text)",
                    border: "1px solid var(--color-border)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit",
                  }}>
                  {isAr ? sub.ar : sub.en}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Toolbar ──────────────────────────────────── */}
        <div className="section-container py-6" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.4 }}>
            {filtered.length} {t("منتج", "items")}
          </p>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text)",
                background: "transparent",
                border: "1px solid var(--color-border)",
                padding: "7px 14px",
                cursor: "pointer",
              }}>
              {isAr ? currentSort?.ar : currentSort?.en}
              <ChevronDown size={12} style={{ transform: sortOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    [isAr ? "right" : "left"]: 0,
                    background: "var(--color-bg)",
                    border: "1px solid var(--color-border)",
                    zIndex: 10,
                    minWidth: "140px",
                  }}
                >
                  {SORT_OPTIONS.map((o) => (
                    <button key={o.id}
                      onClick={() => { setSort(o.id); setSortOpen(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "10px 16px",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--color-text)",
                        background: sort === o.id ? "var(--color-border)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: isAr ? "right" : "left",
                        transition: "background 0.2s",
                      }}>
                      {isAr ? o.ar : o.en}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Products Grid ────────────────────────────── */}
        <div className="section-container pb-20">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse" style={{ background: "var(--color-border)" }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "6rem 0", opacity: 0.3 }}>
              <p style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "1.2rem", color: "var(--color-text)" }}>
                {t("لا توجد منتجات", "No products found")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product: any, i: number) => (
                <motion.div key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
