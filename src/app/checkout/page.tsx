"use client";
// src/app/checkout/page.tsx

import { useState }  from "react";
import { useRouter } from "next/navigation";
import { motion }    from "framer-motion";
import { Check }     from "lucide-react";
import toast         from "react-hot-toast";
import Image         from "next/image";
import Navbar        from "@/components/Navbar";
import Footer        from "@/components/Footer";
import { useStore }  from "@/store/useStore";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db }  from "@/lib/firebase";

export default function CheckoutPage() {
  const { lang, t, cart, cartTotal, clearCart } = useStore();
  const router    = useRouter();
  const isAr      = lang === "ar";
  const [loading, setLoading]   = useState(false);
  const [done,    setDone]      = useState(false);
  const [orderId, setOrderId]   = useState("");

  const [form, setForm] = useState({
    full_name:   "",
    phone:       "",
    email:       "",
    city:        "",
    district:    "",
    street:      "",
    postal_code: "",
    notes:       "",
  });

  function up(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function placeOrder() {
    if (!form.full_name || !form.phone || !form.city || !form.street) {
      toast.error(isAr ? "يرجى ملء الحقول المطلوبة *" : "Fill required fields *");
      return;
    }
    setLoading(true);
    try {
      const ref = await addDoc(collection(db, "orders"), {
        customer:   form,
        items:      cart,
        total:      cartTotal(),
        status:     "pending",
        lang,
        user_email: auth.currentUser?.email || null,
        created_at: serverTimestamp(),
      });
      setOrderId(ref.id);
      setDone(true);
      clearCart();
    } catch {
      toast.error(isAr ? "حدث خطأ، حاول مجدداً" : "Error, please try again");
    } finally {
      setLoading(false);
    }
  }

  // ── Success ────────────────────────────────────────────
  if (done) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center px-6" dir={isAr ? "rtl" : "ltr"}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "#305252" }}>
            <Check size={28} color="#E8DCCA" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold mb-3"
            style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", color: "var(--color-text)" }}>
            {isAr ? "تم استلام طلبك ✓" : "Order Received ✓"}
          </h1>
          <p className="text-xs font-mono my-3" style={{ color: "var(--color-text)", opacity: 0.3 }}>
            #{orderId?.slice(-10).toUpperCase()}
          </p>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--color-text)", opacity: 0.55 }}>
            {isAr ? "سيتم التواصل معك قريباً لتأكيد الطلب." : "We'll contact you soon to confirm."}
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/orders")} className="btn-primary py-3 px-8 w-full">
              {isAr ? "تتبع طلبي" : "Track Order"}
            </button>
            <button onClick={() => router.push("/")}
              className="text-xs tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text)", opacity: 0.4 }}>
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );

  if (cart.length === 0) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center" style={{ opacity: 0.3, color: "var(--color-text)" }}>
        {isAr ? "السلة فارغة" : "Your cart is empty"}
      </div>
    </>
  );

  const FIELDS = [
    { key: "full_name",   ar: "الاسم الكامل *",         en: "Full Name *",          type: "text",  req: true  },
    { key: "phone",       ar: "رقم الهاتف *",           en: "Phone *",              type: "tel",   req: true  },
    { key: "email",       ar: "البريد الإلكتروني",       en: "Email",                type: "email", req: false },
    { key: "city",        ar: "المحافظة / المدينة *",   en: "City / Governorate *", type: "text",  req: true  },
    { key: "district",    ar: "الحي / المنطقة",          en: "District / Area",      type: "text",  req: false },
    { key: "street",      ar: "الشارع والعنوان التفصيلي *", en: "Street & Details *", type: "text", req: true  },
    { key: "postal_code", ar: "الرمز البريدي",           en: "Postal Code",          type: "text",  req: false },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen" dir={isAr ? "rtl" : "ltr"}>
        <div style={{ background: "#38040E", color: "#E8DCCA", padding: "48px 0", textAlign: "center" }}>
          <h1 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: isAr ? 700 : 600 }}>
            {isAr ? "إتمام الطلب" : "Checkout"}
          </h1>
        </div>

        <div className="section-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Form */}
            <div className="lg:col-span-3">
              <h2 className="text-sm tracking-widest uppercase mb-6" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                {isAr ? "بيانات الشحن" : "Shipping Details"}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(({ key, ar, en, type }) => (
                  <div key={key} className={key === "street" || key === "email" ? "sm:col-span-2" : ""}>
                    <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.4 }}>
                      {isAr ? ar : en}
                    </label>
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) => up(key, e.target.value)}
                      className="w-full px-4 py-3 text-sm outline-none transition-all"
                      style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                    />
                  </div>
                ))}

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: "var(--color-text)", opacity: 0.4 }}>
                    {isAr ? "ملاحظات" : "Notes"}
                  </label>
                  <textarea rows={3} value={form.notes} onChange={(e) => up("notes", e.target.value)}
                    className="w-full px-4 py-3 text-sm outline-none resize-none"
                    style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
                </div>
              </div>

              {/* Payment notice */}
              <div className="mt-6 p-4 text-sm" style={{ background: "var(--color-border)", color: "var(--color-text)", opacity: 0.7 }}>
                💳 {isAr
                  ? "الدفع عند الاستلام متاح. سنتواصل معك لتأكيد الطلب وترتيب التوصيل."
                  : "Cash on delivery available. We'll contact you to confirm and arrange delivery."}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2">
              <div className="border p-6 sticky top-24" style={{ borderColor: "var(--color-border)" }}>
                <h2 className="text-sm tracking-widest uppercase mb-5" style={{ color: "var(--color-text)", opacity: 0.5 }}>
                  {isAr ? "ملخص الطلب" : "Order Summary"}
                </h2>

                <div className="flex flex-col gap-4 mb-5">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 items-center">
                      <div style={{ width:"52px", height:"64px", flexShrink:0, position:"relative", overflow:"hidden", background:"var(--color-border)" }}>
                        {item.image && <Image src={item.image} alt="" fill style={{ objectFit:"cover" }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: "var(--color-text)", opacity: 0.8 }}>
                          {isAr ? item.name_ar : item.name_en}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text)", opacity: 0.4 }}>
                          {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium flex-shrink-0" style={{ color: "var(--color-text)" }}>
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text)", opacity: 0.55 }}>
                    <span>{isAr ? "المجموع" : "Subtotal"}</span>
                    <span>{cartTotal().toLocaleString()} {isAr ? "ج.م" : "EGP"}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: "var(--color-text)", opacity: 0.55 }}>
                    <span>{isAr ? "الشحن" : "Shipping"}</span>
                    <span style={{ color: "#2ecc71", fontSize: "12px" }}>{isAr ? "يُحدد لاحقاً" : "TBD"}</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold mt-2" style={{ color: "var(--color-text)" }}>
                    <span>{isAr ? "الإجمالي" : "Total"}</span>
                    <span style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      {cartTotal().toLocaleString()} {isAr ? "ج.م" : "EGP"}
                    </span>
                  </div>
                </div>

                <button onClick={placeOrder} disabled={loading}
                  className="btn-primary w-full mt-5 py-4 disabled:opacity-50">
                  {loading ? "..." : isAr ? "تأكيد الطلب" : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
