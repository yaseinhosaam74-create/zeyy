"use client";
// src/components/animations/FadeUp.tsx
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  delay?:    number;
  duration?: number;
  className?: string;
  once?:     boolean;
}

export function FadeUp({ children, delay = 0, duration = 0.7, className = "", once = true }: Props) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
