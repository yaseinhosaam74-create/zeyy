"use client";
// src/app/product/[id]/page.tsx

import { useState, useEffect } from "react";
import { useParams }           from "next/navigation";
import Image                   from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ChevronLeft, ChevronRight, Ruler, Sparkles, X } from "lucide-react";
import toast                   from "react-hot-toast";
import Navbar                  from "@/components/Navbar";
import Footer                  from "@/components/Footer";
import ProductCard             from "@/components/ProductCard";
import { useStore }            from "@/store/useStore";
import { useProduct, useProducts } from "@/hooks/useFirestore";

// ── AI Sizing Advisor ─────────────────────────────────────
function SizingAdvisor({
  sizes, isAr, onSelect,
}: { sizes: string[]; isAr: boolean; onSelect: (s: string) => void }) {
  const [open,    setOpen]   = useState(false);
  const [height,  setHeight] = useState("");
  const [weight,  setWeight] = useState("");
  const [result,  setResult] = useState<{ size: string; confidence: number } | null>(null);
  const [loading, setLoading]= useState(false);

  function calcSize() {
    if (!height || !weight) {
      toast.error(isAr ? "أدخل الطول والوزن" : "Enter height and weight");
      return;
    }
    setLoading(true);
    // AI-like calculation based on BMI
    const h   = Number(height) / 100;
    const w   = Number(weight);
    const bmi = w / (h * h);
    let recommended = "M";
    let confidence  = 92;

    if      (bmi < 18.5)                    { recommended = "XS"; confidence = 95; }
    else if (bmi >= 18.5 && bmi < 21)       { recommended = "S";  confidence = 94; }
    else if (bmi >= 21   && bmi < 24)       { recommended = "M";  confidence = 96; }
    else if (bmi >= 24   && bmi < 27)       { recommended = "L";  confidence = 93; }
    else if (bmi >= 27   && bmi < 30)       { recommended = "XL"; confidence = 91; }
    else                                    { recommended = "XXL"; confidence = 89; }

    // If size not available, pick closest
    if (!sizes.includes(recommended)) {
      const order  = ["XS","S","M","L","XL","XXL"];
      const idx    = order.indexOf(recommended);
      const avail  = sizes.filter((s) => order.includes(s));
      if (avail.length > 0) {
        recommended = avail.reduce((prev, curr) => {
          return Math.abs(order.indexOf(curr) - idx) < Math.abs(order.indexOf(prev) - idx) ? curr : prev;
        });
        confidence -= 5;
      }
    }

    setTimeout(() => {
      setResult({ size: recommended, confidence });
      setLoading(false);
    }, 800);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
        style={{ color: "var(--color-text)", opacity: 0.55 }}
      >
        <Ruler size={14} strokeWidth={1.5} />
        {isAr ? "مساعد المقاس الذكي" : "AI Size Advisor"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-sm"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
              onClick={(e) => e.stopPropagation()}
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} strokeWidth={1.5} style={{ color: "#38040E" }} />
                  <span className="text-sm font-medium tracking-wide" style={{ color: "var(--color-text)" }}>
                    {isAr ? "مساعد المقاس الذكي" : "AI Size Advisor"}
                  </span>
                </div>
                <button onClick={() => setOpen(false)} style={{ color: "var(--color-text)", opacity: 0.4, background: "none", border: "none", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                {!result ? (
                  <>
                    <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--color-text)", opacity: 0.55 }}>
                      {isAr ? "أدخل قياساتك وسأرشح لك المقاس المثالي" : "Enter your measurements for the perfect size recommendation"}
                    </p>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.45 }}>
                          {isAr ? "الطول (سم)" : "Height (cm)"}
                        </label>
                        <input
                          type="number"
                          placeholder={isAr ? "مثال: 175" : "e.g. 175"}
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          className="w-full px-4 py-3 text-sm outline-none"
                          style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.45 }}>
                          {isAr ? "الوزن (كجم)" : "Weight (kg)"}
                        </label>
                        <input
                          type="number"
                          placeholder={isAr ? "مثال: 70" : "e.g. 70"}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full px-4 py-3 text-sm outline-none"
                          style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                        />
                      </div>
                      <button
                        onClick={calcSize}
                        disabled={loading}
                        className="w-full py-3.5 text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
                        style={{ background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", letterSpacing: "0.12em" }}
                      >
                        {loading
                          ? (isAr ? "جاري الحساب..." : "Calculating...")
                          : (isAr ? "احسب مقاسي" : "Find My Size")}
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
                    <div
                      className="w-20 h-20 flex items-center justify-center mx-auto mb-4 text-3xl font-bold"
                      style={{ background: "#38040E", color: "#E8DCCA", fontFamily: "Cormorant Garamond, serif" }}
                    >
                      {result.size}
                    </div>
                    <p className="text-lg font-semibold mb-1" style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)" }}>
                      {isAr ? `مقاسك هو ${result.size}` : `Your size is ${result.size}`}
                    </p>
                    <p className="text-sm mb-6" style={{ color: "#305252" }}>
                      {result.confidence}% {isAr ? "دقة" : "confidence"}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { onSelect(result.size); setOpen(false); toast.success(isAr ? `تم اختيار ${result.size}` : `Size ${result.size} selected`); }}
                        className="flex-1 py-3 text-sm tracking-widest uppercase"
                        style={{ background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer" }}>
                        {isAr ? "اختر هذا المقاس" : "Select This Size"}
                      </button>
                      <button
                        onClick={() => setResult(null)}
                        className="px-4 py-3 text-sm"
                        style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer", opacity: 0.6 }}>
                        {isAr ? "أعد" : "Redo"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main Product Page ─────────────────────────────────────
export default function ProductPage() {
  const { id }               = useParams<{ id: string }>();
  const { lang, t, addToCart, setCartOpen } = useStore();
  const { product, loading } = useProduct(id as string);
  const { products }         = useProducts();
  const isAr                 = lang === "ar";

  const [selectedSize,  setSelectedSize]  = useState("");
  const [quantity,      setQuantity]      = useState(1);
  const [activeImage,   setActiveImage]   = useState(0);
  const [imgZoom,       setImgZoom]       = useState(false);

  // Complete the Look — same category
  const relatedProducts = products
    .filter((p: any) => p.id !== id && p.category === product?.category)
    .slice(0, 4);

  function handleAddToCart() {
    if (!selectedSize && product?.sizes?.length > 0) {
      toast.error(isAr ? "اختر المقاس أولاً" : "Please select a size");
      return;
    }
    addToCart({
      id:      product.id,
      name_ar: product.name_ar,
      name_en: product.name_en,
      price:   product.price,
      size:    selectedSize || "Free Size",
      quantity,
      image:   product.images?.[0] || "",
      slug:    product.id,
    });
    toast.success(isAr ? "أضيف للسلة ✓" : "Added to cart ✓");
    setCartOpen(true);
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="w-1 h-12 animate-pulse" style={{ background: "var(--color-text)" }} />
      </div>
    </>
  );

  if (!product) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center opacity-30" style={{ color: "var(--color-text)" }}>
        {t("المنتج غير موجود", "Product not found")}
      </div>
    </>
  );

  const images = product.images || [];
  const name   = isAr ? product.name_ar : product.name_en;
  const desc   = isAr ? product.description_ar : product.description_en;
  const badge  = isAr ? product.badge_ar : product.badge_en;

  return (
    <>
      <Navbar />
      <main className="pt-[72px]" dir={isAr ? "rtl" : "ltr"}>
        <div className="section-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* ── Images ────────────────────────────────── */}
            <div>
              {/* Main image */}
              <div
                className="relative overflow-hidden cursor-zoom-in"
                style={{ aspectRatio: "3/4", background: "var(--color-border)" }}
                onClick={() => setImgZoom(true)}
              >
                {images[activeImage] ? (
                  <Image src={images[activeImage]} alt={name} fill style={{ objectFit: "cover" }} priority />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-20">
                    <span className="text-xs tracking-widest" style={{ color: "var(--color-text)" }}>No Image</span>
                  </div>
                )}

                {/* Badge */}
                {badge && !product.sold_out && (
                  <span className="absolute top-3 start-3 badge text-[10px]">{badge}</span>
                )}

                {/* Sold out overlay */}
                {product.sold_out && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                    <span className="text-xs tracking-widest uppercase" style={{ color: "#E8DCCA" }}>
                      {t("نفذت الكمية", "Sold Out")}
                    </span>
                  </div>
                )}

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); setActiveImage((p) => Math.max(0, p - 1)); }}
                      className="absolute top-1/2 start-3 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-100"
                      style={{ background: "rgba(232,220,202,0.85)", opacity: activeImage === 0 ? 0.3 : 0.8 }}>
                      {isAr ? <ChevronRight size={16} color="#38040E" /> : <ChevronLeft size={16} color="#38040E" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setActiveImage((p) => Math.min(images.length - 1, p + 1)); }}
                      className="absolute top-1/2 end-3 -translate-y-1/2 w-9 h-9 flex items-center justify-center transition-opacity hover:opacity-100"
                      style={{ background: "rgba(232,220,202,0.85)", opacity: activeImage === images.length - 1 ? 0.3 : 0.8 }}>
                      {isAr ? <ChevronLeft size={16} color="#38040E" /> : <ChevronRight size={16} color="#38040E" />}
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto">
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      className="relative flex-shrink-0 overflow-hidden transition-all"
                      style={{ width: "64px", height: "80px", border: activeImage === i ? "2px solid var(--color-text)" : "2px solid transparent", opacity: activeImage === i ? 1 : 0.5 }}>
                      <Image src={img} alt="" fill style={{ objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ──────────────────────────────────── */}
            <div className="flex flex-col">

              {/* Category */}
              {product.category && (
                <span className="badge mb-4 self-start text-[10px] uppercase tracking-widest">
                  {product.category}
                </span>
              )}

              {/* Name */}
              <h1 className="leading-tight mb-3"
                style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: isAr ? 700 : 600, color: "var(--color-text)" }}>
                {name}
              </h1>

              {/* Price */}
              <p className="text-2xl font-semibold mb-4" style={{ fontFamily: "Cormorant Garamond, serif", color: "var(--color-text)" }}>
                {product.price?.toLocaleString()} {isAr ? "ج.م" : "EGP"}
              </p>

              {/* Description */}
              {desc && (
                <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--color-text)", opacity: 0.6, fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}>
                  {desc}
                </p>
              )}

              <div className="w-full h-px mb-6" style={{ background: "var(--color-border)" }} />

              {/* Sizes + AI Advisor */}
              {product.sizes?.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs tracking-widest uppercase" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                      {t("المقاس", "Size")}
                    </p>
                    <SizingAdvisor sizes={product.sizes} isAr={isAr} onSelect={setSelectedSize} />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        className="transition-all duration-200 text-sm font-medium"
                        style={{
                          minWidth: "44px",
                          height: "44px",
                          padding: "0 12px",
                          background: selectedSize === size ? "var(--color-text)" : "transparent",
                          color: selectedSize === size ? "var(--color-bg)" : "var(--color-text)",
                          border: "1px solid",
                          borderColor: selectedSize === size ? "var(--color-text)" : "var(--color-border)",
                          cursor: "pointer",
                        }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                  {t("الكمية", "Quantity")}
                </p>
                <div className="flex items-center w-fit" style={{ border: "1px solid var(--color-border)" }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-60"
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text)" }}>−</button>
                  <span className="w-10 text-center text-sm" style={{ color: "var(--color-text)" }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-10 flex items-center justify-center transition-opacity hover:opacity-60"
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text)" }}>+</button>
                </div>
              </div>

              {/* Add to cart */}
              {product.sold_out ? (
                <div className="w-full py-4 text-center text-sm tracking-widest uppercase"
                  style={{ border: "1px solid var(--color-border)", color: "var(--color-text)", opacity: 0.4 }}>
                  {t("نفذت الكمية", "Sold Out")}
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-4">
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  {t("أضف للسلة", "Add to Cart")}
                </motion.button>
              )}

              {/* Details accordion */}
              {(product.details_ar || product.details_en) && (
                <details className="mt-6 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                  <summary className="text-xs tracking-widest uppercase cursor-pointer transition-opacity hover:opacity-100"
                    style={{ color: "var(--color-text)", opacity: 0.45 }}>
                    {t("تفاصيل المنتج", "Product Details")}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed"
                    style={{ color: "var(--color-text)", opacity: 0.6, fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}>
                    {isAr ? product.details_ar : product.details_en}
                  </p>
                </details>
              )}
            </div>
          </div>

          {/* ── Complete the Look ──────────────────────── */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <div className="w-full h-px mb-10" style={{ background: "var(--color-border)" }} />
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: "var(--color-text)", opacity: 0.4 }}>
                    {isAr ? "أكمل إطلالتك" : "Complete the Look"}
                  </p>
                  <h2 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: isAr ? 700 : 600, color: "var(--color-text)" }}>
                    {isAr ? "قد يعجبك أيضاً" : "You May Also Like"}
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p: any, i: number) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zoom overlay */}
        <AnimatePresence>
          {imgZoom && images[activeImage] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
              style={{ background: "rgba(0,0,0,0.9)" }}
              onClick={() => setImgZoom(false)}
            >
              <div style={{ position: "relative", width: "90vw", height: "90vh", maxWidth: "600px" }}>
                <Image src={images[activeImage]} alt={name} fill style={{ objectFit: "contain" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
