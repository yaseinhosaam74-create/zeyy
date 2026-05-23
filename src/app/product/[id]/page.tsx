"use client";
// src/app/product/[id]/page.tsx

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image         from "next/image";
import Link          from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, ChevronLeft, ChevronRight, X,
  Share2, Ruler, Sparkles, ZoomIn, AlertCircle,
  MessageCircle, Copy, Check, ExternalLink,
} from "lucide-react";
import toast         from "react-hot-toast";
import Navbar        from "@/components/Navbar";
import Footer        from "@/components/Footer";
import { useStore }  from "@/store/useStore";
import { useProduct, useProducts } from "@/hooks/useFirestore";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── AI Sizing (inline accordion) ─────────────────────────
const SIZE_RANGES: Record<string, [number, number]> = {
  "XS":  [14,   18.4],
  "S":   [18.5, 21.4],
  "M":   [21.5, 24.9],
  "L":   [25,   28.4],
  "XL":  [28.5, 32],
  "XXL": [32.1, 999],
};

function calcBestSize(height: number, weight: number, availableSizes: string[]) {
  const h   = height / 100;
  const bmi = weight / (h * h);
  const order = ["XS","S","M","L","XL","XXL"];

  // Find ideal size
  let ideal = "M";
  for (const [size, [min, max]] of Object.entries(SIZE_RANGES)) {
    if (bmi >= min && bmi <= max) { ideal = size; break; }
  }

  // Check if available
  if (availableSizes.includes(ideal)) {
    return { size: ideal, confidence: 94, exact: true };
  }

  // Find closest available
  const idealIdx = order.indexOf(ideal);
  let closest = availableSizes[0] || "M";
  let minDist  = 999;
  for (const s of availableSizes) {
    const d = Math.abs(order.indexOf(s) - idealIdx);
    if (d < minDist) { minDist = d; closest = s; }
  }
  return { size: closest, confidence: Math.max(72, 94 - minDist * 10), exact: false, ideal };
}

function SizingAccordion({ sizes, isAr, onSelect }: { sizes: string[]; isAr: boolean; onSelect: (s: string) => void }) {
  const [open,   setOpen]   = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading,setLoading]= useState(false);
  const [error,  setError]  = useState("");

  function calculate() {
    setError("");
    const h = Number(height), w = Number(weight);
    if (!h || !w) { setError(isAr ? "أدخل الطول والوزن" : "Enter height and weight"); return; }
    if (h < 100 || h > 230) { setError(isAr ? "الطول بين 100 و 230 سم" : "Height: 100-230 cm"); return; }
    if (w < 30  || w > 300) { setError(isAr ? "الوزن بين 30 و 300 كجم" : "Weight: 30-300 kg"); return; }
    setLoading(true);
    setTimeout(() => {
      setResult(calcBestSize(h, w, sizes));
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{ border: "1px solid var(--color-border)", marginBottom: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "#38040E", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
            <Ruler size={16} color="#E8DCCA" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: isAr ? "right" : "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>
              {isAr ? "اعرف مقاسك" : "Find My Size"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.45, marginTop: "2px" }}>
              {isAr ? "أدخل الطول والوزن" : "Enter height & weight for your perfect size"}
            </p>
          </div>
        </div>
        <ChevronDown size={16} style={{ color: "var(--color-text)", opacity: 0.4, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: "1px solid var(--color-border)" }}>
            <div style={{ padding: "16px" }} dir={isAr ? "rtl" : "ltr"}>
              {!result ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, marginBottom: "6px" }}>
                        {isAr ? "الطول (سم)" : "HEIGHT (CM)"}
                      </label>
                      <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
                        style={{ width: "100%", padding: "10px 14px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, marginBottom: "6px" }}>
                        {isAr ? "الوزن (كجم)" : "WEIGHT (KG)"}
                      </label>
                      <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
                        style={{ width: "100%", padding: "10px 14px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }} />
                    </div>
                  </div>
                  {error && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)" }}>
                      <AlertCircle size={13} color="#c0392b" />
                      <p style={{ fontSize: "12px", color: "#c0392b" }}>{error}</p>
                    </div>
                  )}
                  <button onClick={calculate} disabled={loading}
                    style={{ width: "100%", padding: "12px", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    {loading ? (isAr ? "جاري الحساب..." : "Calculating...") : (isAr ? "احسب مقاسي" : "Calculate My Size")}
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center" }}>
                  <div style={{ background: "#38040E", color: "#E8DCCA", width: "72px", height: "72px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", borderRadius: "8px" }}>
                    <span style={{ fontSize: "1.8rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 700 }}>{result.size}</span>
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)", marginBottom: "4px" }}>
                    {isAr ? "المقاس الموصى به" : "Recommended size for you"}
                  </p>
                  <p style={{ fontSize: "12px", color: "#305252", marginBottom: "8px" }}>
                    {result.confidence}% {isAr ? "دقة" : "match"}
                  </p>
                  {!result.exact && (
                    <p style={{ fontSize: "11px", color: "#c97b2e", marginBottom: "10px" }}>
                      {isAr ? `مقاسك الأمثل ${result.ideal} غير متاح — أقرب مقاس` : `Your ideal size ${result.ideal} is unavailable — closest available`}
                    </p>
                  )}
                  <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.5, marginBottom: "16px" }}>
                    {isAr ? "اختر مقاساً أكبر للإطلالة الأوفر" : "Choose one size up for an oversized look"}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => { onSelect(result.size); toast.success(isAr ? `تم اختيار ${result.size}` : `Size ${result.size} selected`); setOpen(false); }}
                      style={{ flex: 1, padding: "10px", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px" }}>
                      {isAr ? `اختر ${result.size}` : `Select ${result.size}`}
                    </button>
                    <button onClick={() => setResult(null)}
                      style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer", fontSize: "12px" }}>
                      {isAr ? "أعد" : "Recalculate"}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Complete the Look ─────────────────────────────────────
function CompleteTheLook({ currentProduct, products, isAr, currencyAr, currencyEn, onAddAll }: any) {
  const [open, setOpen] = useState(false);
  const { addToCart, setCartOpen } = useStore();

  const related = products
    .filter((p: any) => p.id !== currentProduct.id && p.gender === currentProduct.gender)
    .slice(0, 2);

  if (related.length === 0) return null;

  const totalPrice = currentProduct.price + related.reduce((s: number, p: any) => s + p.price, 0);
  const currency   = isAr ? currencyAr : currencyEn;

  function addAll() {
    related.forEach((p: any) => {
      addToCart({ id: p.id, name_ar: p.name_ar, name_en: p.name_en, price: p.price, size: p.sizes?.[0] || "Free Size", quantity: 1, image: p.images?.[0] || "", slug: p.id });
    });
    setCartOpen(true);
    toast.success(isAr ? "تمت الإضافة للسلة ✓" : "Added all to cart ✓");
  }

  return (
    <div style={{ border: "1px solid var(--color-border)", marginBottom: "12px" }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "transparent", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "#305252", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px" }}>
            <Sparkles size={16} color="#E8DCCA" strokeWidth={1.5} />
          </div>
          <div style={{ textAlign: isAr ? "right" : "left" }}>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>
              {isAr ? "أكمل إطلالتك" : "Complete Your Look"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.45, marginTop: "2px" }}>
              {isAr ? "قطع تتناسب مع هذا المنتج" : "Pieces that match this item"}
            </p>
          </div>
        </div>
        <ChevronDown size={16} style={{ color: "var(--color-text)", opacity: 0.4, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: "1px solid var(--color-border)" }} dir={isAr ? "rtl" : "ltr"}>
            <div style={{ padding: "0" }}>
              {/* Current item */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid var(--color-border)", background: "var(--color-border)" }}>
                <div style={{ width: "60px", height: "72px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  {currentProduct.images?.[0] && <Image src={currentProduct.images[0]} alt="" fill style={{ objectFit: "cover" }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", color: "var(--color-text)", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>
                    {isAr ? "المنتج الحالي" : "Current item"}
                  </p>
                  <p style={{ fontSize: "13px", color: "var(--color-text)", fontWeight: 500 }}>
                    {isAr ? currentProduct.name_ar : currentProduct.name_en}
                  </p>
                  <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.5, marginTop: "2px" }}>
                    {currentProduct.price?.toLocaleString()} {currency}
                  </p>
                </div>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#305252", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Check size={12} color="#E8DCCA" />
                </div>
              </div>

              {/* Related items */}
              {related.map((p: any) => (
                <Link key={p.id} href={`/product/${p.id}`}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderBottom: "1px solid var(--color-border)", textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--color-border)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width: "60px", height: "72px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                    {p.images?.[0] && <Image src={p.images[0]} alt="" fill style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "10px", color: "var(--color-text)", opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "3px" }}>
                      {isAr ? (p.category || "") : (p.category?.toUpperCase() || "")}
                    </p>
                    <p style={{ fontSize: "13px", color: "var(--color-text)", fontWeight: 500 }}>
                      {isAr ? p.name_ar : p.name_en}
                    </p>
                    <p style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", marginTop: "2px" }}>
                      {p.price?.toLocaleString()} {currency}
                    </p>
                  </div>
                  <ExternalLink size={14} style={{ color: "var(--color-text)", opacity: 0.3, flexShrink: 0 }} />
                </Link>
              ))}

              {/* Total + Add All */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "var(--color-text)", opacity: 0.45 }}>
                    {isAr ? `الإجمالي (${related.length + 1} قطع)` : `Total look (${related.length + 1} pieces)`}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-text)", fontFamily: "Cormorant Garamond, serif" }}>
                    {totalPrice.toLocaleString()} {currency}
                  </p>
                </div>
                <button onClick={addAll}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "var(--color-text)", color: "var(--color-bg)", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 500 }}>
                  <ShoppingBag size={14} />
                  {isAr ? "أضف الكل" : "Add All to Cart"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Share Modal ───────────────────────────────────────────
function ShareModal({ product, isAr, onClose }: any) {
  const [copied, setCopied] = useState(false);
  const url  = typeof window !== "undefined" ? window.location.href : "";
  const name = isAr ? product.name_ar : product.name_en;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const shareItems = [
    { label: "WhatsApp", color: "#25D366", bg: "#25D366",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
      href: `https://wa.me/?text=${encodeURIComponent(`${name}\n${url}`)}` },
    { label: "Twitter / X", color: "#000", bg: "#000",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}` },
    { label: "Facebook", color: "#1877F2", bg: "#1877F2",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "Telegram", color: "#26A5E4", bg: "#26A5E4",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(name)}` },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: "100%", maxWidth: "400px", background: "var(--color-bg)", borderRadius: "16px", overflow: "hidden" }}
        onClick={e => e.stopPropagation()} dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)" }}>
            {isAr ? "مشاركة المنتج" : "Share Product"}
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Product preview */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", background: "var(--color-border)" }}>
          {product.images?.[0] && (
            <div style={{ width: "52px", height: "64px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
              <Image src={product.images[0]} alt="" fill style={{ objectFit: "cover" }} />
            </div>
          )}
          <div>
            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-text)" }}>{name}</p>
            <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.5, marginTop: "3px" }}>
              {isAr ? product.description_ar : product.description_en}
            </p>
          </div>
        </div>

        {/* Share icons */}
        <div style={{ display: "flex", gap: "16px", padding: "20px", justifyContent: "center" }}>
          {shareItems.map(item => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textDecoration: "none" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icon}
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-text)", opacity: 0.6 }}>{item.label}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div style={{ padding: "0 20px 20px" }}>
          <button onClick={copyLink}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: "transparent", border: "1px solid var(--color-border)", cursor: "pointer", fontSize: "13px", color: "var(--color-text)", borderRadius: "8px" }}>
            {copied ? <Check size={16} color="#305252" /> : <Copy size={16} />}
            {copied ? (isAr ? "تم النسخ ✓" : "Copied ✓") : (isAr ? "نسخ الرابط" : "Copy Link")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── ChevronDown icon (local) ──────────────────────────────
function ChevronDown({ size = 16, style = {} }: { size?: number; style?: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={style}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════
export default function ProductPage() {
  const { id }               = useParams<{ id: string }>();
  const { lang, t, addToCart, setCartOpen } = useStore();
  const { product, loading } = useProduct(id as string);
  const { products }         = useProducts();
  const isAr                 = lang === "ar";

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity,     setQuantity]     = useState(1);
  const [activeImage,  setActiveImage]  = useState(0);
  const [zoom,         setZoom]         = useState(false);
  const [shareOpen,    setShareOpen]    = useState(false);
  const [settings,     setSettings]     = useState<any>({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), snap => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  const currencyAr = settings.currency_ar || "ج.م";
  const currencyEn = settings.currency_en || "EGP";
  const currency   = isAr ? currencyAr : currencyEn;

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

  const images  = product.images || [];
  const name    = isAr ? product.name_ar : product.name_en;
  const desc    = isAr ? product.description_ar : product.description_en;
  const badge   = isAr ? product.badge_ar : product.badge_en;
  const hasOffer= product.has_offer && product.offer_price;

  function handleAddToCart() {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.error(isAr ? "اختر المقاس أولاً" : "Please select a size");
      return;
    }
    addToCart({
      id: product.id, name_ar: product.name_ar, name_en: product.name_en,
      price: hasOffer ? product.offer_price : product.price,
      size: selectedSize || "Free Size", quantity,
      image: images[0] || "", slug: product.id,
    });
    toast.success(isAr ? "أضيف للسلة ✓" : "Added to cart ✓");
    setCartOpen(true);
  }

  return (
    <>
      <Navbar />
      <main className="pt-[72px]" dir={isAr ? "rtl" : "ltr"}>
        <div className="section-container py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

            {/* ── Images ─────────────────────────── */}
            <div>
              {/* Main image with zoom */}
              <div style={{ position: "relative", aspectRatio: "3/4", background: "var(--color-border)", overflow: "hidden", cursor: "zoom-in" }}
                onClick={() => setZoom(true)}>
                {images[activeImage] ? (
                  <Image src={images[activeImage]} alt={name} fill style={{ objectFit: "cover" }} priority />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.2 }}>
                    <span style={{ color: "var(--color-text)" }}>No Image</span>
                  </div>
                )}

                {/* Zoom icon */}
                <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(232,220,202,0.9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ZoomIn size={14} color="#38040E" />
                </div>

                {/* Badge */}
                {badge && !product.sold_out && (
                  <span style={{ position: "absolute", top: "12px", left: "12px", padding: "4px 10px", background: "#38040E", color: "#E8DCCA", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {badge}
                  </span>
                )}

                {/* Offer badge */}
                {hasOffer && (
                  <span style={{ position: "absolute", top: "12px", right: "12px", padding: "4px 10px", background: "#c0392b", color: "#fff", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    SALE
                  </span>
                )}

                {product.sold_out && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "#E8DCCA" }}>
                      {t("نفذت الكمية", "Sold Out")}
                    </span>
                  </div>
                )}

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button onClick={e => { e.stopPropagation(); setActiveImage(p => Math.max(0, p - 1)); }}
                      style={{ position: "absolute", top: "50%", left: "10px", transform: "translateY(-50%)", width: "36px", height: "36px", background: "rgba(232,220,202,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: activeImage === 0 ? 0.3 : 0.85 }}>
                      <ChevronLeft size={16} color="#38040E" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setActiveImage(p => Math.min(images.length - 1, p + 1)); }}
                      style={{ position: "absolute", top: "50%", right: "10px", transform: "translateY(-50%)", width: "36px", height: "36px", background: "rgba(232,220,202,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: activeImage === images.length - 1 ? 0.3 : 0.85 }}>
                      <ChevronRight size={16} color="#38040E" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", overflowX: "auto" }}>
                  {images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImage(i)}
                      style={{ width: "64px", height: "80px", position: "relative", overflow: "hidden", flexShrink: 0, border: `2px solid ${activeImage === i ? "var(--color-text)" : "transparent"}`, opacity: activeImage === i ? 1 : 0.5, padding: 0, cursor: "pointer", background: "transparent" }}>
                      <Image src={img} alt="" fill style={{ objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Info ──────────────────────────── */}
            <div style={{ display: "flex", flexDirection: "column" }}>

              {/* Category + Share */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                {product.category && (
                  <span style={{ fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.5 }}>
                    {product.category}
                  </span>
                )}
                <button onClick={() => setShareOpen(true)}
                  style={{ width: "36px", height: "36px", border: "1px solid var(--color-border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text)" }}>
                  <Share2 size={15} strokeWidth={1.5} />
                </button>
              </div>

              {/* Name */}
              <h1 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: isAr ? 700 : 600, color: "var(--color-text)", lineHeight: 1.2, marginBottom: "12px" }}>
                {name}
              </h1>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--color-text)", fontFamily: "Cormorant Garamond, serif" }}>
                  {(hasOffer ? product.offer_price : product.price)?.toLocaleString()} {currency}
                </span>
                {hasOffer && (
                  <span style={{ fontSize: "1rem", color: "var(--color-text)", opacity: 0.4, textDecoration: "line-through" }}>
                    {product.price?.toLocaleString()} {currency}
                  </span>
                )}
              </div>

              {desc && (
                <p style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--color-text)", opacity: 0.6, marginBottom: "20px", fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}>
                  {desc}
                </p>
              )}

              <div style={{ width: "100%", height: "1px", background: "var(--color-border)", marginBottom: "20px" }} />

              {/* Sizes */}
              {product.sizes?.length > 0 && (
                <div style={{ marginBottom: "20px" }}>
                  <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.5, marginBottom: "10px" }}>
                    {t("المقاس", "Size")}
                  </p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {product.sizes.map((size: string) => (
                      <button key={size} onClick={() => setSelectedSize(size)}
                        style={{ minWidth: "44px", height: "44px", padding: "0 12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", background: selectedSize === size ? "var(--color-text)" : "transparent", color: selectedSize === size ? "var(--color-bg)" : "var(--color-text)", border: "1px solid", borderColor: selectedSize === size ? "var(--color-text)" : "var(--color-border)" }}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.5, marginBottom: "10px" }}>
                  {t("الكمية", "Quantity")}
                </p>
                <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--color-border)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: "40px", height: "40px", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text)", fontSize: "18px" }}>−</button>
                  <span style={{ width: "40px", textAlign: "center", fontSize: "14px", color: "var(--color-text)" }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} style={{ width: "40px", height: "40px", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text)", fontSize: "18px" }}>+</button>
                </div>
              </div>

              {/* Add to cart */}
              {product.sold_out ? (
                <div style={{ width: "100%", padding: "16px", textAlign: "center", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", border: "1px solid var(--color-border)", color: "var(--color-text)", opacity: 0.4, marginBottom: "20px" }}>
                  {t("نفذت الكمية", "Sold Out")}
                </div>
              ) : (
                <motion.button whileTap={{ scale: 0.98 }} onClick={handleAddToCart}
                  style={{ width: "100%", padding: "16px", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  {t("أضف للسلة", "Add to Cart")}
                </motion.button>
              )}

              {/* AI Sizing accordion */}
              {product.sizes?.length > 0 && (
                <SizingAccordion sizes={product.sizes} isAr={isAr} onSelect={setSelectedSize} />
              )}

              {/* Complete the Look */}
              <CompleteTheLook
                currentProduct={product}
                products={products}
                isAr={isAr}
                currencyAr={currencyAr}
                currencyEn={currencyEn}
              />

              {/* Details */}
              {(product.details_ar || product.details_en) && (
                <details style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px", marginTop: "4px" }}>
                  <summary style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, cursor: "pointer" }}>
                    {t("تفاصيل المنتج", "Product Details")}
                  </summary>
                  <p style={{ marginTop: "12px", fontSize: "13px", lineHeight: 1.7, color: "var(--color-text)", opacity: 0.6, fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}>
                    {isAr ? product.details_ar : product.details_en}
                  </p>
                </details>
              )}
            </div>
          </div>
        </div>

        {/* Zoom overlay */}
        <AnimatePresence>
          {zoom && images[activeImage] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}
              onClick={() => setZoom(false)}>
              <div style={{ position: "relative", width: "90vw", height: "90vh", maxWidth: "600px" }}>
                <Image src={images[activeImage]} alt={name} fill style={{ objectFit: "contain" }} />
              </div>
              <button style={{ position: "absolute", top: "20px", right: "20px", width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Share modal */}
        <AnimatePresence>
          {shareOpen && <ShareModal product={product} isAr={isAr} onClose={() => setShareOpen(false)} />}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );
}
