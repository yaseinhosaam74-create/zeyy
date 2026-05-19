"use client";
// src/app/orders/page.tsx

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, db }  from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link          from "next/link";
import Image         from "next/image";
import Navbar        from "@/components/Navbar";
import Footer        from "@/components/Footer";
import { useStore }  from "@/store/useStore";
import { Package, ChevronDown, MessageCircle, X } from "lucide-react";

const STATUS_CONFIG: Record<string, { ar: string; en: string; color: string; step: number }> = {
  pending:   { ar: "قيد المراجعة", en: "Pending",   color: "#c97b2e", step: 1 },
  confirmed: { ar: "تم التأكيد",   en: "Confirmed", color: "#3498db", step: 2 },
  shipped:   { ar: "في الطريق",    en: "Shipped",   color: "#9b59b6", step: 3 },
  delivered: { ar: "تم التوصيل",   en: "Delivered", color: "#305252", step: 4 },
  cancelled: { ar: "ملغي",         en: "Cancelled", color: "#c0392b", step: 0 },
};

const STEPS = ["pending", "confirmed", "shipped", "delivered"];

// ── Order progress bar ────────────────────────────────────
function OrderProgress({ status, isAr }: { status: string; isAr: boolean }) {
  const cfg     = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const current = cfg.step;
  if (status === "cancelled") return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 0" }}>
      <div style={{ width: "8px", height: "8px", background: "#c0392b", borderRadius: "50%" }} />
      <span style={{ fontSize: "12px", color: "#c0392b", letterSpacing: "0.08em" }}>
        {isAr ? "تم الإلغاء" : "Cancelled"}
      </span>
    </div>
  );

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
        {STEPS.map((step, i) => {
          const s       = STATUS_CONFIG[step];
          const done    = current > i + 1;
          const active  = current === i + 1;
          const pending = current < i + 1;
          return (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
              {/* Circle */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                <div style={{
                  width:        active ? "14px" : "10px",
                  height:       active ? "14px" : "10px",
                  borderRadius: "50%",
                  background:   done || active ? (active ? cfg.color : "#305252") : "transparent",
                  border:       `2px solid ${done || active ? (active ? cfg.color : "#305252") : "var(--color-border)"}`,
                  transition:   "all 0.3s",
                }} />
                <span style={{
                  fontSize:     "9px",
                  marginTop:    "4px",
                  color:        done || active ? "var(--color-text)" : "var(--color-text)",
                  opacity:      pending ? 0.3 : 1,
                  letterSpacing:"0.05em",
                  whiteSpace:   "nowrap",
                  textAlign:    "center",
                }}>
                  {isAr ? s.ar.split(" ")[0] : step.charAt(0).toUpperCase() + step.slice(1)}
                </span>
              </div>
              {/* Line */}
              {i < STEPS.length - 1 && (
                <div style={{
                  flex:       1,
                  height:     "2px",
                  background: done ? "#305252" : "var(--color-border)",
                  marginBottom: "16px",
                  transition: "background 0.5s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { lang }             = useStore();
  const [user,   setUser]    = useState<User | null>(null);
  const [orders, setOrders]  = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [open,   setOpen]    = useState<string | null>(null);
  const [settings,setSettings]= useState<any>({});
  const isAr                 = lang === "ar";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); if (!u) setLoading(false); });
    return () => unsub();
  }, []);

  // Load store settings (WhatsApp)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "orders"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const all  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const mine = all.filter((o: any) =>
        o.user_email === user.email || o.customer?.email === user.email
      );
      setOrders(mine);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // Cancel order
  async function cancelOrder(orderId: string) {
    if (!confirm(isAr ? "هل تريد إلغاء الطلب؟" : "Cancel this order?")) return;
    await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
  }

  // WhatsApp support
  function openWhatsApp(message: string) {
    const number = settings.whatsapp_number || "01121454510";
    const url    = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  function whatsAppCancel(orderId: string) {
    const template = isAr
      ? (settings.cancel_whatsapp_msg_ar || "مرحباً، أريد إلغاء طلبي رقم: {order_id}")
      : (settings.cancel_whatsapp_msg_en || "Hello, I want to cancel my order: {order_id}");
    openWhatsApp(template.replace("{order_id}", `#${orderId.slice(-8).toUpperCase()}`));
  }

  function whatsAppSupport() {
    const msg = isAr
      ? (settings.whatsapp_message_ar || "مرحباً، أريد الاستفسار عن طلبي 🛍️")
      : (settings.whatsapp_message_en || "Hello, I need help with my order 🛍️");
    openWhatsApp(msg);
  }

  // ── Not logged in ──────────────────────────────────────
  if (!loading && !user) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex flex-col items-center justify-center gap-6 px-6" dir={isAr ? "rtl" : "ltr"}>
        <Package size={48} strokeWidth={1} style={{ opacity: 0.2, color: "var(--color-text)" }} />
        <p style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)", opacity: 0.5, fontSize: "1.2rem" }}>
          {isAr ? "سجّل دخولك لعرض طلباتك" : "Sign in to view your orders"}
        </p>
        <Link href="/account" className="btn-primary px-8 py-3">
          {isAr ? "تسجيل الدخول" : "Sign In"}
        </Link>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" dir={isAr ? "rtl" : "ltr"}>

        {/* Header — contrasting background */}
        <div style={{ background: "#38040E", color: "#E8DCCA", padding: "48px 0", textAlign: "center" }}>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: isAr ? 700 : 600, letterSpacing: isAr ? "0.02em" : "-0.02em" }}>
            {isAr ? "طلباتي" : "My Orders"}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ delay: 0.3, duration: 0.5 }}
            style={{ fontSize: "13px", marginTop: "8px", letterSpacing: "0.1em" }}>
            {orders.length > 0 ? `${orders.length} ${isAr ? "طلبات" : "orders"}` : ""}
          </motion.p>
        </div>

        <div className="section-container py-10 max-w-2xl">

          {/* WhatsApp support button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={whatsAppSupport}
            className="w-full flex items-center justify-center gap-3 mb-8 py-3.5 transition-all"
            style={{ background: "#25D366", color: "#fff", border: "none", cursor: "pointer", fontSize: "13px", letterSpacing: "0.08em" }}
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            {isAr ? "تواصل مع الدعم عبر واتساب" : "Contact Support via WhatsApp"}
          </motion.button>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2].map(i => <div key={i} className="h-24 animate-pulse" style={{ background: "var(--color-border)" }} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <Package size={56} strokeWidth={1} style={{ opacity: 0.15, color: "var(--color-text)" }} />
              <p style={{ color: "var(--color-text)", opacity: 0.4, fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "1.1rem" }}>
                {isAr ? "لا توجد طلبات بعد" : "No orders yet"}
              </p>
              <Link href="/shop" className="btn-primary px-8 py-3">
                {isAr ? "ابدأ التسوق" : "Start Shopping"}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order, idx) => {
                const cfg    = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                const isOpen = open === order.id;
                const canCancel = ["pending", "confirmed"].includes(order.status);

                return (
                  <motion.div key={order.id}
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                    style={{ border: "1px solid var(--color-border)", overflow: "hidden", background: "var(--color-bg)" }}>

                    {/* Header */}
                    <button
                      onClick={() => setOpen(isOpen ? null : order.id)}
                      className="w-full flex items-center justify-between p-5"
                      style={{ background: "transparent", border: "none", cursor: "pointer", textAlign: isAr ? "right" : "left" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        {/* Status dot */}
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: cfg.color, flexShrink: 0, boxShadow: `0 0 0 3px ${cfg.color}33` }} />
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-text)", fontFamily: "monospace" }}>
                            #{order.id?.slice(-8).toUpperCase()}
                          </p>
                          <p style={{ fontSize: "11px", color: cfg.color, marginTop: "2px", letterSpacing: "0.05em" }}>
                            {isAr ? cfg.ar : cfg.en}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ textAlign: isAr ? "left" : "right" }}>
                          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--color-text)", fontFamily: "Cormorant Garamond, serif" }}>
                            {order.total?.toLocaleString()} {isAr ? (settings.currency_ar || "ج.م") : (settings.currency_en || "EGP")}
                          </p>
                          <p style={{ fontSize: "11px", color: "var(--color-text)", opacity: 0.4, marginTop: "2px" }}>
                            {order.items?.length} {isAr ? "قطعة" : "items"}
                          </p>
                        </div>
                        <ChevronDown size={16} style={{ color: "var(--color-text)", opacity: 0.4, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", flexShrink: 0 }} />
                      </div>
                    </button>

                    {/* Progress bar */}
                    <div style={{ padding: "0 20px" }}>
                      <OrderProgress status={order.status} isAr={isAr} />
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                          style={{ borderTop: "1px solid var(--color-border)", overflow: "hidden" }}
                        >
                          <div style={{ padding: "16px 20px" }}>
                            {/* Items */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                              {order.items?.map((item: any, i: number) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div style={{ width: "52px", height: "64px", flexShrink: 0, position: "relative", overflow: "hidden", background: "var(--color-border)" }}>
                                    {item.image && <Image src={item.image} alt="" fill style={{ objectFit: "cover" }} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: "13px", color: "var(--color-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {isAr ? item.name_ar : item.name_en}
                                    </p>
                                    <p style={{ fontSize: "11px", color: "var(--color-text)", opacity: 0.4, marginTop: "3px" }}>
                                      {item.size} × {item.quantity} = {(item.price * item.quantity).toLocaleString()} {isAr ? (settings.currency_ar || "ج.م") : (settings.currency_en || "EGP")}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Address */}
                            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginBottom: "14px" }}>
                              <p style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, marginBottom: "5px" }}>
                                {isAr ? "عنوان التوصيل" : "Delivery Address"}
                              </p>
                              <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.7 }}>
                                {order.customer?.full_name} · {order.customer?.phone}
                              </p>
                              <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.5, marginTop: "2px" }}>
                                {[order.customer?.city, order.customer?.district, order.customer?.street].filter(Boolean).join(" · ")}
                              </p>
                            </div>

                            {/* Actions */}
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              {/* WhatsApp support */}
                              <button
                                onClick={() => openWhatsApp(
                                  (isAr ? (settings.whatsapp_message_ar || "مرحباً، أريد الاستفسار عن طلبي") : (settings.whatsapp_message_en || "Hello, I need help with my order")) +
                                  ` #${order.id?.slice(-8).toUpperCase()}`
                                )}
                                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#25D366", color: "#fff", border: "none", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}
                              >
                                <MessageCircle size={13} />
                                {isAr ? "واتساب" : "WhatsApp"}
                              </button>

                              {/* Cancel */}
                              {canCancel && (
                                <button
                                  onClick={() => {
                                    whatsAppCancel(order.id);
                                    cancelOrder(order.id);
                                  }}
                                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "transparent", color: "#c0392b", border: "1px solid #c0392b33", cursor: "pointer", fontSize: "11px", letterSpacing: "0.08em" }}
                                >
                                  <X size={12} />
                                  {isAr ? "إلغاء الطلب" : "Cancel Order"}
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
