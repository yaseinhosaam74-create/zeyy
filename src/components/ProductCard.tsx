"use client";
// src/components/ProductCard.tsx

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/store/useStore";
import toast from "react-hot-toast";

interface Props {
  product: {
    id: string;
    name_ar: string;
    name_en: string;
    price: number;
    images: string[];
    category: string;
    sizes: string[];
    sold_out: boolean;
    badge_ar?: string;
    badge_en?: string;
  };
}

export default function ProductCard({ product }: Props) {
  const [hovered, setHovered]   = useState(false);
  const { lang, addToCart, setCartOpen } = useStore();
  const isAr = lang === "ar";

  const name  = isAr ? product.name_ar : product.name_en;
  const badge = isAr ? product.badge_ar : product.badge_en;
  const img1  = product.images?.[0] || "/assets/placeholders/product.jpg";
  const img2  = product.images?.[1] || img1;

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (product.sold_out) return;
    const size = product.sizes?.[0] || "M";
    addToCart({
      id:       product.id,
      name_ar:  product.name_ar,
      name_en:  product.name_en,
      price:    product.price,
      size,
      quantity: 1,
      image:    img1,
      slug:     product.id,
    });
    toast.success(isAr ? "أضيف للسلة ✓" : "Added to cart ✓");
    setCartOpen(true);
  }

  return (
    <Link href={`/product/${product.id}`}>
      <div
        className="group relative cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: "var(--color-surface, #f0ece4)" }}>
          <Image
            src={img1}
            alt={name}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-105"
            style={{ opacity: hovered && img2 !== img1 ? 0 : 1 }}
          />
          {img2 !== img1 && (
            <Image
              src={img2}
              alt={name}
              fill
              className="object-cover transition-all duration-700 absolute inset-0"
              style={{ opacity: hovered ? 1 : 0 }}
            />
          )}

          {/* Sold out overlay */}
          {product.sold_out && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.35)" }}
            >
              <span className="text-xs tracking-widest uppercase text-white/80">
                {isAr ? "نفذت الكمية" : "Sold Out"}
              </span>
            </div>
          )}

          {/* Badge */}
          {badge && !product.sold_out && (
            <span className="absolute top-3 start-3 badge text-[10px]">
              {badge}
            </span>
          )}

          {/* Quick add — appears on hover */}
          {!product.sold_out && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
              transition={{ duration: 0.25 }}
              onClick={quickAdd}
              className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase"
              style={{ background: "var(--brand-hero-red)", color: "#E8DCCA", letterSpacing: "0.12em" }}
            >
              <ShoppingBag size={12} strokeWidth={1.5} />
              {isAr ? "أضف للسلة" : "Quick Add"}
            </motion.button>
          )}
        </div>

        {/* Info */}
        <div className="mt-3" dir={isAr ? "rtl" : "ltr"}>
          <h3
            className="text-sm font-medium leading-snug truncate"
            style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}
          >
            {name}
          </h3>
          <p className="text-sm mt-0.5 opacity-60">
            {product.price.toLocaleString()} {isAr ? "ر.س" : "SAR"}
          </p>
        </div>
      </div>
    </Link>
  );
}
