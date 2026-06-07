"use client";
// src/app/orders/page.tsx

import { useState, useEffect }     from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, type User }                           from "firebase/auth";
import { auth, db }                from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Link                        from "next/link";
import Image                       from "next/image";
import Navbar                      from "@/components/Navbar";
import Footer                      from "@/components/Footer";
import { useStore }                from "@/store/useStore";
import { Package, ChevronDown, X, Check, Truck, Clock, MessageCircle } from "lucide-react";

const STATUS: Record<string, { ar: string; en: string; color: string; step: number }> = {
  pending:   { ar: "قيد المراجعة", en: "Pending",   color: "#c97b2e", step: 1 },
  confirmed: { ar: "تم التأكيد",   en: "Confirmed", color: "#3498db", step: 2 },
  shipped:   { ar: "في الطريق",    en: "Shipped",   color: "#305252", step: 3 },
  delivered: { ar: "تم التوصيل",   en: "Delivered", color: "#2ecc71", step: 4 },
  cancelled: { ar: "ملغي",         en: "Cancelled", color: "#c0392b", step: 0 },
};
const STEPS = ["pending","confirmed","shipped","delivered"];

// Progress bar
function Progress({ status, isAr }: { status: string; isAr: boolean }) {
  const cfg = STATUS[status] || STATUS.pending;
  if (status === "cancelled") return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 0 12px" }}>
      <X size={12} color="#c0392b"/>
      <span style={{ fontSize:"11px", color:"#c0392b" }}>{isAr ? "ملغي" : "Cancelled"}</span>
    </div>
  );
  return (
    <div style={{ padding:"10px 0 14px" }}>
      <div style={{ display:"flex", alignItems:"center" }}>
        {STEPS.map((step, i) => {
          const s      = STATUS[step];
          const done   = cfg.step > i + 1;
          const active = cfg.step === i + 1;
          return (
            <div key={step} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : 0 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flexShrink:0 }}>
                <div style={{
                  width:        active ? "13px" : "9px",
                  height:       active ? "13px" : "9px",
                  borderRadius: "50%",
                  background:   done||active ? (active ? cfg.color : "#305252") : "transparent",
                  border:       `2px solid ${done||active ? (active ? cfg.color : "#305252") : "var(--color-border)"}`,
                  transition:   "all 0.3s",
                  flexShrink:   0,
                }}/>
                <span style={{ fontSize:"9px", color:"var(--color-text)", opacity: done||active ? 0.7 : 0.25, marginTop:"4px", letterSpacing:"0.04em", whiteSpace:"nowrap" }}>
                  {isAr ? s.ar.split(" ")[0] : step.charAt(0).toUpperCase()+step.slice(1)}
                </span>
              </div>
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:"1.5px", background: done ? "#305252" : "var(--color-border)", marginBottom:"18px", transition:"background 0.4s" }}/>
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
  const [user,   setUser]    = useState<User|null>(null);
  const [orders, setOrders]  = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [open,   setOpen]    = useState<string|null>(null);
  const [settings,setSettings]=useState<any>({});
  const isAr                 = lang === "ar";

  useEffect(()=>{
    const u=onAuthStateChanged(auth, u=>{setUser(u); if(!u) setLoading(false);});
    return ()=>u();
  },[]);

  useEffect(()=>{
    const u=onSnapshot(doc(db,"settings","store"), s=>{if(s.exists()) setSettings(s.data());});
    return ()=>u();
  },[]);

  useEffect(()=>{
    if(!user) return;
    const q=query(collection(db,"orders"),orderBy("created_at","desc"));
    const u=onSnapshot(q, snap=>{
      const all=snap.docs.map(d=>({id:d.id,...d.data()}));
      setOrders(all.filter((o:any)=>o.user_email===user.email||o.customer?.email===user.email));
      setLoading(false);
    });
    return ()=>u();
  },[user]);

  // Direct cancel — no WhatsApp redirect
  async function cancelOrder(orderId: string) {
    if(!confirm(isAr?"هل تريد إلغاء الطلب؟":"Cancel this order?")) return;
    await updateDoc(doc(db,"orders",orderId),{status:"cancelled"});
  }

  // WhatsApp support
  function openWhatsApp(orderId: string) {
    const number  = settings.whatsapp_number||"01121454510";
    const msg     = isAr
      ? (settings.whatsapp_message_ar||"مرحباً، أريد الاستفسار عن طلبي")+` #${orderId.slice(-8).toUpperCase()}`
      : (settings.whatsapp_message_en||"Hello, I need help with my order")+` #${orderId.slice(-8).toUpperCase()}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`,"_blank");
  }

  const currency = isAr ? (settings.currency_ar||"ج.م") : (settings.currency_en||"EGP");

  if(!loading&&!user) return (
    <>
      <Navbar/>
      <div className="min-h-screen pt-[72px] flex flex-col items-center justify-center gap-6 px-6" dir={isAr?"rtl":"ltr"}>
        <Package size={48} strokeWidth={1} style={{ opacity:0.2, color:"var(--color-text)" }}/>
        <p style={{ fontFamily:isAr?"Aref Ruqaa, serif":"Cormorant Garamond, serif", color:"var(--color-text)", opacity:0.5, fontSize:"1.2rem" }}>
          {isAr?"سجّل دخولك لعرض طلباتك":"Sign in to view your orders"}
        </p>
        <Link href="/account" className="btn-primary px-8 py-3">
          {isAr?"تسجيل الدخول":"Sign In"}
        </Link>
      </div>
    </>
  );

  return (
    <>
      <Navbar/>
      <main className="min-h-screen pt-[72px]" dir={isAr?"rtl":"ltr"}>

        {/* Header */}
        <div style={{ background:"#38040E", color:"#E8DCCA", padding:"48px 0", textAlign:"center" }}>
          <motion.h1 initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}
            style={{ fontFamily:isAr?"Aref Ruqaa, serif":"Cormorant Garamond, serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:isAr?700:600 }}>
            {isAr?"طلباتي":"My Orders"}
          </motion.h1>
        </div>

        <div className="section-container py-10 max-w-2xl">

          {/* WhatsApp support button — site style */}
          <motion.button initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            onClick={()=>openWhatsApp("")}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"center",
              gap:"10px", padding:"13px", marginBottom:"24px",
              background:"transparent", border:"1px solid var(--color-border)",
              color:"var(--color-text)", cursor:"pointer", fontSize:"12px",
              letterSpacing:"0.1em", textTransform:"uppercase",
              transition:"all 0.2s",
            }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--color-text)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--color-border)";}}
          >
            {/* WhatsApp icon — site style */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            {isAr?"تواصل مع الدعم":"Contact Support"}
          </motion.button>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2].map(i=><div key={i} className="h-24 animate-pulse" style={{ background:"var(--color-border)" }}/>)}
            </div>
          ) : orders.length===0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5">
              <Package size={56} strokeWidth={1} style={{ opacity:0.15, color:"var(--color-text)" }}/>
              <p style={{ color:"var(--color-text)", opacity:0.4, fontFamily:isAr?"Aref Ruqaa, serif":"Cormorant Garamond, serif", fontSize:"1.1rem" }}>
                {isAr?"لا توجد طلبات بعد":"No orders yet"}
              </p>
              <Link href="/shop" className="btn-primary px-8 py-3">
                {isAr?"ابدأ التسوق":"Start Shopping"}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order,idx)=>{
                const cfg     = STATUS[order.status]||STATUS.pending;
                const isOpen  = open===order.id;
                const canCancel = ["pending","confirmed"].includes(order.status);
                return (
                  <motion.div key={order.id}
                    initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.5, delay:idx*0.06 }}
                    style={{ border:"1px solid var(--color-border)", overflow:"hidden", background:"var(--color-bg)" }}>

                    {/* Header */}
                    <button onClick={()=>setOpen(isOpen?null:order.id)}
                      style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", background:"transparent", borderTop:"none", borderLeft:"none", borderRight:"none", borderBottom:"none", cursor:"pointer", textAlign:isAr?"right":"left" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:cfg.color, flexShrink:0, boxShadow:`0 0 0 3px ${cfg.color}33` }}/>
                        <div>
                          <p style={{ fontSize:"13px", fontWeight:500, color:"var(--color-text)", fontFamily:"monospace" }}>
                            #{order.id?.slice(-8).toUpperCase()}
                          </p>
                          <p style={{ fontSize:"11px", color:cfg.color, marginTop:"2px" }}>
                            {isAr?cfg.ar:cfg.en}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                        <div style={{ textAlign:isAr?"left":"right" }}>
                          <p style={{ fontSize:"15px", fontWeight:600, color:"var(--color-text)", fontFamily:"Cormorant Garamond, serif" }}>
                            {order.total?.toLocaleString()} {currency}
                          </p>
                          <p style={{ fontSize:"11px", color:"var(--color-text)", opacity:0.4, marginTop:"2px" }}>
                            {order.items?.reduce((t:number,i:any)=>t+(i.quantity||1),0)} {isAr?"قطعة":"pcs"}
                          </p>
                        </div>
                        <ChevronDown size={15} style={{ color:"var(--color-text)", opacity:0.35, transform:isOpen?"rotate(180deg)":"rotate(0)", transition:"transform 0.3s", flexShrink:0 }}/>
                      </div>
                    </button>

                    {/* Progress */}
                    <div style={{ paddingInline:"20px" }}>
                      <Progress status={order.status} isAr={isAr}/>
                    </div>

                    {/* Details */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }} exit={{ height:0, opacity:0 }}
                          transition={{ duration:0.3 }}
                          style={{ borderTop:"1px solid var(--color-border)", overflow:"hidden" }}>
                          <div style={{ padding:"16px 20px" }}>

                            {/* Items */}
                            <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"14px" }}>
                              {order.items?.map((item:any,i:number)=>(
                                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                                  <div style={{ width:"48px", height:"60px", flexShrink:0, position:"relative", overflow:"hidden", background:"var(--color-border)" }}>
                                    {item.image&&<Image src={item.image} alt="" fill style={{ objectFit:"cover" }}/>}
                                  </div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ fontSize:"12px", color:"var(--color-text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                      {isAr?item.name_ar:item.name_en}
                                    </p>
                                    <p style={{ fontSize:"11px", color:"var(--color-text)", opacity:0.4, marginTop:"2px" }}>
                                      {item.size} × {item.quantity} = {(item.price*(item.quantity||1)).toLocaleString()} {currency}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Address */}
                            <div style={{ borderTop:"1px solid var(--color-border)", paddingTop:"12px", marginBottom:"14px" }}>
                              <p style={{ fontSize:"9px", letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--color-text)", opacity:0.35, marginBottom:"5px" }}>
                                {isAr?"عنوان التوصيل":"Delivery Address"}
                              </p>
                              <p style={{ fontSize:"12px", color:"var(--color-text)", opacity:0.7 }}>
                                {order.customer?.full_name} · {order.customer?.phone}
                              </p>
                              <p style={{ fontSize:"12px", color:"var(--color-text)", opacity:0.5, marginTop:"2px" }}>
                                {[order.customer?.city,order.customer?.district,order.customer?.street].filter(Boolean).join(" · ")}
                              </p>
                            </div>

                            {/* Actions */}
                            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                              {/* WhatsApp — site style icon */}
                              <button onClick={()=>openWhatsApp(order.id)}
                                style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 14px", background:"transparent", border:"1px solid var(--color-border)", color:"var(--color-text)", cursor:"pointer", fontSize:"11px", letterSpacing:"0.08em" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                {isAr?"واتساب":"WhatsApp"}
                              </button>

                              {/* Cancel — direct, no WhatsApp */}
                              {canCancel && (
                                <button onClick={()=>cancelOrder(order.id)}
                                  style={{ display:"flex", alignItems:"center", gap:"6px", padding:"9px 14px", background:"transparent", border:"1px solid rgba(192,57,43,0.3)", color:"#c0392b", cursor:"pointer", fontSize:"11px", letterSpacing:"0.08em" }}>
                                  <X size={11}/>
                                  {isAr?"إلغاء الطلب":"Cancel Order"}
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
      <Footer/>
    </>
  );
}
