"use client";
// src/hooks/useLenis.ts
import { useEffect } from "react";

let lenisInstance: any = null;

export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Mobile: skip Lenis, use native scroll
    if (window.innerWidth < 768) return;

    async function init() {
      try {
        const { default: Lenis } = await import("lenis");
        if (lenisInstance) lenisInstance.destroy();

        lenisInstance = new Lenis({
          lerp:        0.08,
          duration:    1.4,
          easing:      (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
        });

        function raf(time: number) {
          lenisInstance?.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      } catch (e) {
        // Lenis not available, skip
      }
    }

    init();

    return () => {
      lenisInstance?.destroy();
      lenisInstance = null;
    };
  }, []);
}
