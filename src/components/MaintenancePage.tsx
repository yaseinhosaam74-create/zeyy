"use client";
// src/components/MaintenancePage.tsx

import { motion } from "framer-motion";

interface Props {
  messageAr:     string;
  messageEn:     string;
  estimatedTime: string;
  lang:          "ar" | "en";
}

export default function MaintenancePage({ messageAr, messageEn, estimatedTime, lang }: Props) {
  const message = lang === "ar" ? messageAr : messageEn;
  const isAr    = lang === "ar";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: "#38040E", color: "#E8DCCA" }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center px-6 max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12"
        >
          <h1
            className="text-5xl sm:text-6xl tracking-widest"
            style={{
              fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
              fontWeight: isAr ? 700 : 600,
              color: "#E8DCCA",
            }}
          >
            {isAr ? "زِيّ" : "zeyy"}
          </h1>
        </motion.div>

        {/* Thin divider line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="w-16 h-px mx-auto mb-10"
          style={{ background: "#E8DCCA", opacity: 0.4 }}
        />

        {/* Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-xl sm:text-2xl mb-4 leading-relaxed"
          style={{
            fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
            opacity: 0.85,
          }}
        >
          {message}
        </motion.p>

        {/* Estimated time */}
        {estimatedTime && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-sm tracking-widest uppercase"
            style={{ opacity: 0.45, letterSpacing: "0.15em" }}
          >
            {estimatedTime}
          </motion.p>
        )}

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="flex items-center justify-center gap-2 mt-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="block w-1 h-1 rounded-full"
              style={{ background: "#E8DCCA" }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
