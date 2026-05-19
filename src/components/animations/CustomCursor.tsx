"use client";
// src/components/animations/CustomCursor.tsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence }     from "framer-motion";

type Variant = "default" | "hover-product" | "hover-link" | "hover-cta";

const CONFIG: Record<Variant, { size: number; label?: string; filled?: boolean }> = {
  "default":       { size: 14 },
  "hover-link":    { size: 22 },
  "hover-product": { size: 56, label: "VIEW" },
  "hover-cta":     { size: 38, filled: true },
};

export function CustomCursor() {
  const [pos,     setPos]     = useState({ x: -100, y: -100 });
  const [variant, setVariant] = useState<Variant>("default");
  const [visible, setVisible] = useState(false);
  const lerpPos = useRef({ x: -100, y: -100 });
  const mouse   = useRef({ x: -100, y: -100 });
  const rafId   = useRef<number>();

  useEffect(() => {
    // Only desktop
    if (window.innerWidth < 768) return;

    function onMove(e: MouseEvent) {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    }
    function onLeave() { setVisible(false); }

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

    function animate() {
      lerpPos.current.x = lerp(lerpPos.current.x, mouse.current.x, 0.1);
      lerpPos.current.y = lerp(lerpPos.current.y, mouse.current.y, 0.1);
      setPos({ x: lerpPos.current.x, y: lerpPos.current.y });
      rafId.current = requestAnimationFrame(animate);
    }
    rafId.current = requestAnimationFrame(animate);

    // Expose cursor variant setter globally
    (window as any).zeyySetCursor = (v: Variant) => setVariant(v);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const cfg = CONFIG[variant];

  return (
    <div className="hidden md:block pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed top-0 left-0 z-[99999] pointer-events-none"
            style={{
              x: pos.x - cfg.size / 2,
              y: pos.y - cfg.size / 2,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              animate={{
                width:           cfg.size,
                height:          cfg.size,
                backgroundColor: cfg.filled ? "#38040E" : "transparent",
                borderColor:     "#38040E",
              }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              style={{
                borderRadius:    "50%",
                borderWidth:     "1px",
                borderStyle:     "solid",
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
              }}
            >
              {cfg.label && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontFamily:    "Cormorant Garamond, serif",
                    fontSize:      "9px",
                    letterSpacing: "0.15em",
                    color:         "#38040E",
                  }}
                >
                  {cfg.label}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper hooks for components
export function useCursorHover(variant: Variant = "hover-link") {
  return {
    onMouseEnter: () => typeof window !== "undefined" && (window as any).zeyySetCursor?.(variant),
    onMouseLeave: () => typeof window !== "undefined" && (window as any).zeyySetCursor?.("default"),
  };
}
