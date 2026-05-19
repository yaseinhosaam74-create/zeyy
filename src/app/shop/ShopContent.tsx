"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

const ShopPageClient = dynamic(
  () => import("./ShopContent"),
  { ssr: false }
);

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />}>
      <ShopPageClient />
    </Suspense>
  );
}
