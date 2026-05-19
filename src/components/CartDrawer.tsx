"use client";
// src/components/CartDrawer.tsx

import { useEffect }              from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Link  from "next/link";
import Image from "next/image";
import { useStore } from "@/store/useStore";

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, lang, removeFromCart, updateQuantity, cartTotal } = useStore();
  const isAr = lang === "ar";

  // Lock body scroll when open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop — full screen, high z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setCartOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: isAr ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isAr ? "-100%" : "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              [isAr ? "left" : "right"]: 0,
              zIndex: 9999,
              width: "100%",
              maxWidth: "380px",
              display: "flex",
              flexDirection: "column",
              background: "var(--color-bg)",
              borderLeft: isAr ? "none" : "1px solid var(--color-border)",
              borderRight: isAr ? "1px solid var(--color-border)" : "none",
            }}
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <h2 style={{ fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.7 }}>
                {isAr ? "سلة التسوق" : "Your Cart"}
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                style={{ color: "var(--color-text)", opacity: 0.5, cursor: "pointer", background: "none", border: "none", padding: "4px" }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {cart.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px", opacity: 0.3 }}>
                  <ShoppingBag size={40} strokeWidth={1} color="var(--color-text)" />
                  <p style={{ fontSize: "13px", letterSpacing: "0.1em", color: "var(--color-text)" }}>
                    {isAr ? "السلة فارغة" : "Your cart is empty"}
                  </p>
                </div>
              ) : (
                <ul>
                  {cart.map((item) => (
                    <li
                      key={`${item.id}-${item.size}`}
                      style={{
                        display: "flex",
                        gap: "16px",
                        padding: "20px 24px",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: "relative", width: "72px", height: "88px", flexShrink: 0, background: "var(--color-border)", overflow: "hidden" }}>
                        {item.image && (
                          <Image src={item.image} alt={isAr ? item.name_ar : item.name_en} fill style={{ objectFit: "cover" }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", minWidth: 0 }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {isAr ? item.name_ar : item.name_en}
                          </p>
                          <p style={{ fontSize: "11px", opacity: 0.4, marginTop: "2px", color: "var(--color-text)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                            {item.size}
                          </p>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          {/* Qty */}
                          <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-border)" }}>
                            <button
                              onClick={() => item.quantity <= 1 ? removeFromCart(item.id, item.size) : updateQuantity(item.id, item.size, item.quantity - 1)}
                              style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.6 }}
                            >
                              <Minus size={11} />
                            </button>
                            <span style={{ width: "28px", textAlign: "center", fontSize: "13px", color: "var(--color-text)" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                              style={{ width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.6 }}
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text)" }}>
                              {(item.price * item.quantity).toLocaleString()} {isAr ? "ر.س" : "SAR"}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.id, item.size)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.3 }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding: "24px", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span style={{ fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.5, color: "var(--color-text)" }}>
                    {isAr ? "المجموع" : "Total"}
                  </span>
                  <span style={{ fontSize: "20px", fontWeight: 600, color: "var(--color-text)", fontFamily: "Cormorant Garamond, serif" }}>
                    {cartTotal().toLocaleString()} {isAr ? "ر.س" : "SAR"}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={() => setCartOpen(false)}
                  style={{
                    display: "block",
                    textAlign: "center",
                    padding: "14px",
                    background: "var(--brand-hero-red, #38040E)",
                    color: "#E8DCCA",
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >
                  {isAr ? "إتمام الطلب" : "Checkout"}
                </Link>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{ width: "100%", marginTop: "12px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.35, color: "var(--color-text)", background: "none", border: "none", cursor: "pointer" }}
                >
                  {isAr ? "متابعة التسوق" : "Continue Shopping"}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
