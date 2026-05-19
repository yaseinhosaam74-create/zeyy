"use client";
// src/components/animations/PageLoader.tsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem("zeyy-loaded")) {
      setLoading(false);
      return;
    }
    const t = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem("zeyy-loaded", "1");
    }, 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "#38040E" }}
          initial={{ y: 0 }}
          exit={{
            y: "-100%",
            transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "Aref Ruqaa, serif",
              fontSize: "clamp(3rem, 10vw, 6rem)",
              fontWeight: 700,
              color: "#E8DCCA",
              letterSpacing: "0.05em",
            }}
          >
            زِيّ
          </motion.span>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-0 left-0 h-[2px]"
            style={{ background: "#E8DCCA", opacity: 0.3 }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.85, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
