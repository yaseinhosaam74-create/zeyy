"use client";
// src/app/checkout/page.tsx

import { useState, useEffect }  from "react";
import { useRouter }            from "next/navigation";
import { motion }               from "framer-motion";
import { Check }                from "lucide-react";
import toast                    from "react-hot-toast";
import Image                    from "next/image";
import Link                     from "next/link";
import Navbar                   from "@/components/Navbar";
import Footer                   from "@/components/Footer";
import { useStore }             from "@/store/useStore";
import { addDoc, collection, serverTimestamp, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db }             from "@/lib/firebase";
import { onAuthStateChanged }   from "firebase/auth";

const EMPTY = { full_name:"", phone:"", email:"", city:"", district:"", street:"", postal_code:"", notes:"" };

export default function CheckoutPage() {
  const { lang, cart, cartTotal, clearCart } = useStore();
  const router   = useRouter();
  const isAr     = lang === "ar";
  const [loading,  setLoading]   = useState(false);
  const [done,     setDone]      = useState(false);
  const [orderId,  setOrderId]   = useState("");
  const [user,     setUser]      = useState<any>(null);
  const [form,     setForm]      = useState(EMPTY);
  const [settings, setSettings]  = useState<any>({});
  const [saved,    setSaved]     = useState(false);

  // Get current user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  // Load store settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), s => {
      if (s.exists()) setSettings(s.data());
    });
    return () => unsub();
  }, []);

  // Auto-fill saved address when user is logged in
  useEffect(() => {
    if (!user) return;
    async function loadSaved() {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.saved_address) {
            setForm({ ...EMPTY, ...data.saved_address });
            setSaved(true);
          } else if (data.email) {
            setForm(f => ({ ...f, email: data.email, full_name: data.name || "" }));
          }
        }
      } catch {}
    }
    loadSaved();
  }, [user]);

  function up(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setSaved(false);
  }

  // Save address to Firestore
  async function saveAddress() {
    if (!user) return;
    const { notes, ...address } = form;
    await setDoc(doc(db, "users", user.uid), { saved_address: address }, { merge: true });
    setSaved(true);
    toast.success(isAr ? "تم حفظ العنوان ✓" : "Address saved ✓");
  }

  async function placeOrder() {
    if (!form.full_name || !form.phone || !form.city || !form.street) {
      toast.error(isAr ? "يرجى ملء الحقول المطلوبة *" : "Fill required fields *");
      return;
    }
    setLoading(true);
    try {
      // Auto-save address for logged-in users
      if (user) {
        const { notes, ...address } = form;
        await setDoc(doc(db, "users", user.uid), { saved_address: address }, { merge: true });
      }

      const ref = await addDoc(collection(db, "orders"), {
        customer:   form,
        items:      cart,
        total:      cartTotal(),
        status:     "pending",
        lang,
        user_email: user?.email || null,
        user_uid:   user?.uid   || null,
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

  const currency = isAr ? (settings.currency_ar || "ج.م") : (settings.currency_en || "EGP");

  // ── Success ─────────────────────────────────────────────
  if (done) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center px-6" dir={isAr ? "rtl" : "ltr"}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#305252", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Check size={28} color="#E8DCCA" strokeWidth={1.5} />
          </div>
          <h1 style={{ fontFamily:isAr?"Aref Ruqaa, serif":"Cormorant Garamond, serif", fontSize:"1.6rem", fontWeight:isAr?700:600, color:"var(--color-text)", marginBottom:"8px" }}>
            {isAr ? "تم استلام طلبك ✓" : "Order Received ✓"}
          </h1>
          <p style={{ fontSize:"11px", fontFamily:"monospace", color:"var(--color-text)", opacity:0.3, marginBottom:"10px" }}>
            #{orderId?.slice(-10).toUpperCase()}
          </p>
          <p style={{ fontSize:"14px", color:"var(--color-text)", opacity:0.55, lineHeight:1.7, marginBottom:"24px" }}>
            {isAr ? "سيتم التواصل معك قريباً لتأكيد الطلب." : "We'll contact you soon to confirm."}
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <button onClick={() => router.push("/orders")} className="btn-primary w-full py-3">
              {isAr ? "تتبع طلبي" : "Track Order"}
            </button>
            <Link href="/" style={{ fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.4 }}>
              {isAr ? "العودة للرئيسية" : "Back to Home"}
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );

  if (cart.length === 0) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center" style={{ color:"var(--color-text)", opacity:0.3 }}>
        {isAr ? "السلة فارغة" : "Your cart is empty"}
      </div>
    </>
  );

  const FIELDS = [
    { key:"full_name",   ar:"الاسم الكامل *",          en:"Full Name *",          type:"text",  req:true  },
    { key:"phone",       ar:"رقم الهاتف *",             en:"Phone *",              type:"tel",   req:true  },
    { key:"email",       ar:"البريد الإلكتروني",        en:"Email",                type:"email", req:false },
    { key:"city",        ar:"المحافظة / المدينة *",     en:"City / Governorate *", type:"text",  req:true  },
    { key:"district",    ar:"الحي / المنطقة",           en:"District / Area",      type:"text",  req:false },
    { key:"street",      ar:"الشارع والعنوان التفصيلي *", en:"Street & Details *", type:"text",  req:true  },
    { key:"postal_code", ar:"الرمز البريدي",            en:"Postal Code",          type:"text",  req:false },
  ];

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen" dir={isAr ? "rtl" : "ltr"}>
        <div style={{ background:"#38040E", color:"#E8DCCA", padding:"48px 0", textAlign:"center" }}>
          <h1 style={{ fontFamily:isAr?"Aref Ruqaa, serif":"Cormorant Garamond, serif", fontSize:"2rem", fontWeight:isAr?700:600 }}>
            {isAr ? "إتمام الطلب" : "Checkout"}
          </h1>
        </div>

        <div className="section-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* ── Form ────────────────────────────── */}
            <div className="lg:col-span-3">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"8px" }}>
                <h2 style={{ fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.5 }}>
                  {isAr ? "بيانات الشحن" : "Shipping Details"}
                </h2>
                {/* Save address button — only for logged-in users */}
                {user && (
                  <button onClick={saveAddress}
                    style={{ fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", color: saved ? "#305252" : "var(--color-text)", opacity: saved ? 1 : 0.5, background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:"5px" }}>
                    {saved ? "✓ " : ""}{isAr ? "حفظ العنوان" : "Save Address"}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FIELDS.map(({ key, ar, en, type }) => (
                  <div key={key} className={key === "street" || key === "email" ? "sm:col-span-2" : ""}>
                    <label style={{ display:"block", fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.4, marginBottom:"6px" }}>
                      {isAr ? ar : en}
                    </label>
                    <input
                      type={type}
                      value={(form as any)[key] || ""}
                      onChange={e => up(key, e.target.value)}
                      style={{ width:"100%", padding:"12px 16px", fontSize:"14px", background:"var(--color-input-bg)", border:"1px solid var(--color-border)", color:"var(--color-text)", outline:"none" }}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label style={{ display:"block", fontSize:"10px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.4, marginBottom:"6px" }}>
                    {isAr ? "ملاحظات" : "Notes"}
                  </label>
                  <textarea rows={3} value={form.notes || ""} onChange={e => up("notes", e.target.value)}
                    style={{ width:"100%", padding:"12px 16px", fontSize:"14px", background:"var(--color-input-bg)", border:"1px solid var(--color-border)", color:"var(--color-text)", outline:"none", resize:"none" }} />
                </div>
              </div>

              <div style={{ marginTop:"16px", padding:"14px 16px", background:"var(--color-surface)", border:"1px solid var(--color-border)", fontSize:"13px", color:"var(--color-text)", opacity:0.65, lineHeight:1.7 }}>
                💳 {isAr ? "الدفع عند الاستلام — سنتواصل معك لتأكيد الطلب." : "Cash on delivery — We'll contact you to confirm."}
              </div>
            </div>

            {/* ── Summary ─────────────────────────── */}
            <div className="lg:col-span-2">
              <div style={{ border:"1px solid var(--color-border)", padding:"20px", position:"sticky", top:"88px", background:"var(--color-bg)" }}>
                <h2 style={{ fontSize:"11px", letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.5, marginBottom:"16px" }}>
                  {isAr ? "ملخص الطلب" : "Order Summary"}
                </h2>

                <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"16px" }}>
                  {cart.map(item => (
                    <div key={`${item.id}-${item.size}`} style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                      <div style={{ width:"48px", height:"60px", flexShrink:0, position:"relative", overflow:"hidden", background:"var(--color-border)" }}>
                        {item.image && <Image src={item.image} alt="" fill style={{ objectFit:"cover" }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:"12px", color:"var(--color-text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {isAr ? item.name_ar : item.name_en}
                        </p>
                        <p style={{ fontSize:"11px", color:"var(--color-text)", opacity:0.4, marginTop:"2px" }}>
                          {item.size} × {item.quantity}
                        </p>
                      </div>
                      <p style={{ fontSize:"12px", fontWeight:500, color:"var(--color-text)", flexShrink:0 }}>
                        {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop:"1px solid var(--color-border)", paddingTop:"12px", display:"flex", flexDirection:"column", gap:"8px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"var(--color-text)", opacity:0.55 }}>
                    <span>{isAr ? "المجموع" : "Subtotal"}</span>
                    <span>{cartTotal().toLocaleString()} {currency}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"13px", color:"var(--color-text)", opacity:0.55 }}>
                    <span>{isAr ? "الشحن" : "Shipping"}</span>
                    <span style={{ color:"#305252", fontSize:"12px" }}>{isAr ? "يُحدد لاحقاً" : "TBD"}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:"16px", fontWeight:700, color:"var(--color-text)", fontFamily:"Cormorant Garamond, serif", marginTop:"4px" }}>
                    <span>{isAr ? "الإجمالي" : "Total"}</span>
                    <span>{cartTotal().toLocaleString()} {currency}</span>
                  </div>
                </div>

                <button onClick={placeOrder} disabled={loading}
                  className="btn-primary w-full mt-4 py-4"
                  style={{ opacity: loading ? 0.6 : 1 }}>
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
