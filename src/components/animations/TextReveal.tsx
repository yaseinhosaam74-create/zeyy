"use client";
// src/components/animations/TextReveal.tsx
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: string;
  className?: string;
  delay?:    number;
  tag?:      "h1"|"h2"|"h3"|"h4"|"p"|"span";
}

export function TextReveal({ children, className = "", delay = 0, tag = "p" }: Props) {
  const ref     = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const lines = children.split("\n");

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <div key={i} style={{ overflow: "hidden", lineHeight: "1.15" }}>
          <motion.div
            initial={{ y: "105%" }}
            animate={visible ? { y: 0 } : { y: "105%" }}
            transition={{
              duration: 0.9,
              delay:    delay + i * 0.08,
              ease:     [0.16, 1, 0.3, 1],
            }}
          >
            {line || "\u00A0"}
          </motion.div>
        </div>
      ))}
    </div>
  );
}
