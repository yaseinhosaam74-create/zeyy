"use client";
// src/components/SizingAdvisor.tsx
// Accurate AI sizing based on height + weight + chest/waist optional

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ruler, Sparkles, X, AlertCircle } from "lucide-react";

interface Props {
  sizes:    string[];
  isAr:     boolean;
  category: string; // hoodie, tshirt, etc.
  onSelect: (size: string) => void;
}

// International size chart (height cm + weight kg)
const SIZE_CHART = [
  { size: "XS",        heightMax: 170, weightMax: 60,  chest: [76, 84]  },
  { size: "S",         heightMax: 175, weightMax: 72,  chest: [84, 92]  },
  { size: "M",         heightMax: 182, weightMax: 82,  chest: [92, 100] },
  { size: "L",         heightMax: 188, weightMax: 95,  chest: [100, 108]},
  { size: "XL",        heightMax: 194, weightMax: 110, chest: [108, 116]},
  { size: "XXL",       heightMax: 200, weightMax: 130, chest: [116, 126]},
  { size: "Free Size", heightMax: 999, weightMax: 999, chest: [76, 126] },
];

function calcSize(height: number, weight: number): { size: string; confidence: number; note_ar: string; note_en: string } {
  const h   = height / 100;
  const bmi = weight / (h * h);

  // Score each size
  let best      = "M";
  let bestScore = 0;

  for (const entry of SIZE_CHART) {
    if (entry.size === "Free Size") continue;
    let score = 0;

    // BMI scoring
    const expectedBMI: Record<string, [number, number]> = {
      "XS":  [14,   18.4],
      "S":   [18.5, 21.4],
      "M":   [21.5, 24.9],
      "L":   [25,   28.4],
      "XL":  [28.5, 32],
      "XXL": [32.1, 45],
    };
    const [bmiMin, bmiMax] = expectedBMI[entry.size] || [20, 25];
    if (bmi >= bmiMin && bmi <= bmiMax) {
      score += 60;
    } else {
      const dist = Math.min(Math.abs(bmi - bmiMin), Math.abs(bmi - bmiMax));
      score += Math.max(0, 60 - dist * 5);
    }

    // Height scoring
    const prevMax = SIZE_CHART[SIZE_CHART.findIndex(s => s.size === entry.size) - 1]?.heightMax || 0;
    if (height > prevMax && height <= entry.heightMax) {
      score += 40;
    } else {
      const distH = Math.min(Math.abs(height - prevMax), Math.abs(height - entry.heightMax));
      score += Math.max(0, 40 - distH * 2);
    }

    if (score > bestScore) { bestScore = score; best = entry.size; }
  }

  // Confidence based on how well they fit
  const confidence = Math.min(97, Math.max(75, Math.round(bestScore)));

  // BMI-based notes
  let note_ar = "";
  let note_en = "";
  if (bmi < 18.5) {
    note_ar = "نصيحة: قد تحتاج مقاساً أصغر للمنتجات الضيقة.";
    note_en = "Tip: Consider sizing down for slim-fit items.";
  } else if (bmi > 35) {
    note_ar = "نصيحة: قد تحتاج مقاساً أكبر للراحة الكاملة.";
    note_en = "Tip: Consider sizing up for maximum comfort.";
  } else {
    note_ar = "هذا المقاس يناسب قياساتك بشكل ممتاز.";
    note_en = "This size fits your measurements perfectly.";
  }

  return { size: best, confidence, note_ar, note_en };
}

export function SizingAdvisor({ sizes, isAr, category, onSelect }: Props) {
  const [open,    setOpen]   = useState(false);
  const [height,  setHeight] = useState("");
  const [weight,  setWeight] = useState("");
  const [result,  setResult] = useState<any>(null);
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState("");

  function calculate() {
    setError("");
    const h = Number(height);
    const w = Number(weight);

    if (!h || !w) { setError(isAr ? "أدخل الطول والوزن" : "Enter height and weight"); return; }
    if (h < 100 || h > 230) { setError(isAr ? "الطول يجب أن يكون بين 100 و 230 سم" : "Height must be 100-230 cm"); return; }
    if (w < 30 || w > 300) { setError(isAr ? "الوزن يجب أن يكون بين 30 و 300 كجم" : "Weight must be 30-300 kg"); return; }

    setLoading(true);
    setTimeout(() => {
      const calc = calcSize(h, w);

      // If recommended size not in product sizes, find closest
      let finalSize   = calc.size;
      let sizeNote_ar = calc.note_ar;
      let sizeNote_en = calc.note_en;
      let confidence  = calc.confidence;

      if (!sizes.includes(finalSize) && sizes.length > 0) {
        const order    = ["XS","S","M","L","XL","XXL","Free Size"];
        const recIdx   = order.indexOf(finalSize);
        let   closest  = sizes[0];
        let   minDist  = 999;
        for (const s of sizes) {
          const d = Math.abs(order.indexOf(s) - recIdx);
          if (d < minDist) { minDist = d; closest = s; }
        }
        finalSize   = closest;
        confidence  = Math.max(70, confidence - minDist * 8);
        sizeNote_ar = `مقاس ${calc.size} غير متوفر. أقرب مقاس متاح: ${finalSize}`;
        sizeNote_en = `Size ${calc.size} unavailable. Closest available: ${finalSize}`;
      }

      setResult({ size: finalSize, confidence, note_ar: sizeNote_ar, note_en: sizeNote_en, recommended: calc.size });
      setLoading(false);
    }, 700);
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-xs tracking-widest uppercase transition-opacity hover:opacity-70"
        style={{ color: "var(--color-text)", opacity: 0.55, background: "none", border: "none", cursor: "pointer" }}>
        <Ruler size={13} strokeWidth={1.5} />
        {isAr ? "مساعد المقاس الذكي" : "AI Size Advisor"}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => { setOpen(false); setResult(null); setError(""); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="w-full max-w-sm"
              style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}
              onClick={(e) => e.stopPropagation()}
              dir={isAr ? "rtl" : "ltr"}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={15} strokeWidth={1.5} style={{ color: "#38040E" }} />
                  <span className="text-sm font-medium" style={{ color: "var(--color-text)", letterSpacing: "0.04em" }}>
                    {isAr ? "مساعد المقاس الذكي" : "AI Size Advisor"}
                  </span>
                </div>
                <button onClick={() => { setOpen(false); setResult(null); setError(""); }}
                  style={{ color: "var(--color-text)", opacity: 0.4, background: "none", border: "none", cursor: "pointer" }}>
                  <X size={16} />
                </button>
              </div>

              <div className="p-5">
                <AnimatePresence mode="wait">
                  {!result ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs mb-5 leading-relaxed" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                        {isAr ? "أدخل قياساتك للحصول على توصية دقيقة" : "Enter your measurements for an accurate recommendation"}
                      </p>
                      <div className="flex flex-col gap-4">
                        <div>
                          <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.45 }}>
                            {isAr ? "الطول (سم) — مثال: 175" : "Height (cm) — e.g. 175"}
                          </label>
                          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                            placeholder={isAr ? "175" : "175"}
                            className="w-full px-4 py-3 text-sm outline-none"
                            style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
                        </div>
                        <div>
                          <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.45 }}>
                            {isAr ? "الوزن (كجم) — مثال: 75" : "Weight (kg) — e.g. 75"}
                          </label>
                          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                            placeholder={isAr ? "75" : "75"}
                            className="w-full px-4 py-3 text-sm outline-none"
                            style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
                        </div>

                        {error && (
                          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)" }}>
                            <AlertCircle size={13} color="#c0392b" />
                            <p className="text-xs" style={{ color: "#c0392b" }}>{error}</p>
                          </div>
                        )}

                        <button onClick={calculate} disabled={loading}
                          className="w-full py-3.5 text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-50"
                          style={{ background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", letterSpacing: "0.12em" }}>
                          {loading ? (isAr ? "جاري الحساب..." : "Calculating...") : (isAr ? "احسب مقاسي" : "Find My Size")}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                      {/* Size display */}
                      <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4"
                        style={{ background: "#38040E", color: "#E8DCCA" }}>
                        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 700 }}>
                          {result.size}
                        </span>
                      </div>

                      <p className="text-lg font-semibold mb-1"
                        style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)" }}>
                        {isAr ? `مقاسك المقترح: ${result.size}` : `Recommended Size: ${result.size}`}
                      </p>

                      {/* Confidence bar */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex-1 h-1.5 max-w-[120px]" style={{ background: "var(--color-border)", borderRadius: "2px" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.confidence}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            style={{ height: "100%", background: "#305252", borderRadius: "2px" }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "#305252" }}>
                          {result.confidence}%
                        </span>
                      </div>

                      <p className="text-xs mb-6 leading-relaxed px-2"
                        style={{ color: "var(--color-text)", opacity: 0.55 }}>
                        {isAr ? result.note_ar : result.note_en}
                      </p>

                      {result.recommended !== result.size && (
                        <p className="text-xs mb-4" style={{ color: "#c97b2e", opacity: 0.8 }}>
                          {isAr ? `* مقاسك الأساسي هو ${result.recommended} لكنه غير متاح في هذا المنتج` : `* Your ideal size is ${result.recommended} but it's not available in this product`}
                        </p>
                      )}

                      <div className="flex gap-3">
                        <button onClick={() => { onSelect(result.size); setOpen(false); setResult(null); }}
                          className="flex-1 py-3 text-sm tracking-widest uppercase"
                          style={{ background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer" }}>
                          {isAr ? "اختر هذا المقاس" : "Select This Size"}
                        </button>
                        <button onClick={() => setResult(null)}
                          className="px-4 py-3 text-sm transition-opacity hover:opacity-60"
                          style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer" }}>
                          {isAr ? "أعد" : "Redo"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
