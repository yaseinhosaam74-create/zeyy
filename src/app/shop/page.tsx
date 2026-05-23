"use client";
// src/app/shop/page.tsx
import { Suspense } from "react";
import { useStore } from "@/store/useStore";

// Lazy import to avoid SSR issues
import dynamic from "next/dynamic";
const ShopClient = dynamic(() => import("./ShopClient"), { ssr: false });

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />
    }>
      <ShopClient />
    </Suspense>
  );
}
