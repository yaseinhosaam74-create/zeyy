"use client";
// src/app/shop/ShopClient.tsx

import { useState, useEffect } from "react";
import { useSearchParams }     from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Navbar         from "@/components/Navbar";
import Footer         from "@/components/Footer";
import ProductCard    from "@/components/ProductCard";
import { useStore }   from "@/store/useStore";
import { useProducts } from "@/hooks/useFirestore";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const SORT_OPTIONS = [
  { id: "newest",    ar: "الأحدث",  en: "Newest"  },
  { id: "price_asc", ar: "السعر ↑", en: "Price ↑" },
  { id: "price_desc",ar: "السعر ↓", en: "Price ↓" },
];

export default function ShopClient() {
  const { lang, t }        = useStore();
  const searchParams       = useSearchParams();
  const isAr               = lang === "ar";
  const [gender,   setGender]   = useState("all");
  const [category, setCategory] = useState("all");
  const [sort,     setSort]     = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  const { products, loading } = useProducts();

  useEffect(() => {
    const g = searchParams.get("gender");
    const c = searchParams.get("category");
    if (g) setGender(g);
    if (c) setCategory(c);
  }, [searchParams]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), snap => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  const currencyAr = settings.currency_ar || "ج.م";
  const currencyEn = settings.currency_en || "EGP";

  const filtered = products
    .filter((p: any) => gender === "all" || p.gender === gender || p.gender === "unisex")
    .filter((p: any) => category === "all" || p.category === category)
    .filter((p: any) => !p.sold_out || true)
    .sort((a: any, b: any) => {
      if (sort === "price_asc")  return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return 0;
    });

  const currentSort = SORT_OPTIONS.find(o => o.id === sort);

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen" dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div style={{ background: "#38040E", color: "#E8DCCA", padding: "56px 0", textAlign: "center" }}>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ duration: 0.6 }}
            style={{ fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>
            {t("تسوق الآن", "Shop Now")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(2rem, 5vw, 4rem)", fontWeight: isAr ? 700 : 600 }}>
            {gender === "men"   ? t("رجالي",           "Men")
             : gender === "women" ? t("حريمي",          "Women")
             : t("المجموعة الكاملة", "Full Collection")}
          </motion.h1>
        </div>

        {/* Gender Tabs */}
        <div style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
          <div className="section-container" style={{ display: "flex" }}>
            {[
              { id: "all",   ar: "الكل",   en: "All"   },
              { id: "men",   ar: "رجالي",  en: "Men"   },
              { id: "women", ar: "حريمي",  en: "Women" },
            ].map(g => (
              <button key={g.id} onClick={() => { setGender(g.id); setCategory("all"); }}
                style={{
                  padding: "16px 24px", fontSize: "12px", letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "var(--color-text)",
                  borderBottom: gender === g.id ? "2px solid var(--color-text)" : "2px solid transparent",
                  opacity: gender === g.id ? 1 : 0.4, background: "transparent",
                  cursor: "pointer", transition: "all 0.2s",
                  fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                  border: "none", borderBottom: gender === g.id ? "2px solid var(--color-text)" : "2px solid transparent",
                } as any}>
                {isAr ? g.ar : g.en}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="section-container py-5" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.4 }}>
            {filtered.length} {t("منتج", "items")}
          </p>
          <div style={{ position: "relative" }}>
            <button onClick={() => setSortOpen(!sortOpen)}
              style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", background: "transparent", border: "1px solid var(--color-border)", padding: "7px 14px", cursor: "pointer" }}>
              {isAr ? currentSort?.ar : currentSort?.en}
              <ChevronDown size={12} style={{ transform: sortOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ position: "absolute", top: "calc(100% + 4px)", [isAr ? "right" : "left"]: 0, background: "var(--color-bg)", border: "1px solid var(--color-border)", zIndex: 10, minWidth: "140px" }}>
                  {SORT_OPTIONS.map(o => (
                    <button key={o.id} onClick={() => { setSort(o.id); setSortOpen(false); }}
                      style={{ display: "block", width: "100%", padding: "10px 16px", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", background: sort === o.id ? "var(--color-border)" : "transparent", border: "none", cursor: "pointer", textAlign: isAr ? "right" : "left" }}>
                      {isAr ? o.ar : o.en}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Grid */}
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
                <motion.div key={product.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.04 }}>
                  <ProductCard product={product} currencyAr={currencyAr} currencyEn={currencyEn} />
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
