"use client";
// src/app/contact/page.tsx

import { useState }  from "react";
import { motion }    from "framer-motion";
import { Send }      from "lucide-react";
import toast         from "react-hot-toast";
import Navbar        from "@/components/Navbar";
import Footer        from "@/components/Footer";
import { useStore }  from "@/store/useStore";
import { useSocial } from "@/hooks/useFirestore";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db }        from "@/lib/firebase";

// ── Same icons as Footer ───────────────────────────────────
const SOCIAL_META: Record<string, { label_ar: string; label_en: string; icon: React.ReactNode }> = {
  instagram: {
    label_ar: "إنستغرام",
    label_en: "Instagram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="3.5"/>
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  tiktok: {
    label_ar: "تيك توك",
    label_en: "TikTok",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 106.33 6.34V8.69a8.21 8.21 0 004.79 1.53V6.78a4.85 4.85 0 01-1.02-.09z"/>
      </svg>
    ),
  },
  snapchat: {
    label_ar: "سناب شات",
    label_en: "Snapchat",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.74 2 6.5 4.58 6.5 7.5v.64c-.42.1-.85.2-1.28.3-.28.07-.5.28-.55.57-.05.28.07.57.3.73.53.37 1.2.59 1.89.65-.2.4-.48.74-.83.97-.1.07-.16.18-.16.3 0 .24.2.44.44.44h.08c.48-.07.95-.2 1.4-.37.26.84.87 2.77 3.21 2.77s2.95-1.93 3.21-2.77c.45.17.92.3 1.4.37h.08c.24 0 .44-.2.44-.44 0-.12-.06-.23-.16-.3-.35-.23-.63-.57-.83-.97.69-.06 1.36-.28 1.89-.65.23-.16.35-.45.3-.73-.05-.29-.27-.5-.55-.57-.43-.1-.86-.2-1.28-.3V7.5C17.5 4.58 15.26 2 12 2z"/>
      </svg>
    ),
  },
  twitter: {
    label_ar: "تويتر / X",
    label_en: "X / Twitter",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  youtube: {
    label_ar: "يوتيوب",
    label_en: "YouTube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
};

// ── Social icon — same style as Footer ────────────────────
function SocialIcon({ platform, url, isAr }: { platform: string; url: string; isAr: boolean }) {
  const [hovered, setHovered] = useState(false);
  const meta = SOCIAL_META[platform];
  if (!meta) return null;

  return (
    <div style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          width:           "40px",
          height:          "40px",
          color:           "#E8DCCA",
          background:      hovered ? "rgba(232,220,202,0.18)" : "transparent",
          border:          "1px solid rgba(232,220,202,0.22)",
          transition:      "all 0.25s",
          transform:       hovered ? "translateY(-2px)" : "translateY(0)",
          textDecoration:  "none",
        }}
        aria-label={isAr ? meta.label_ar : meta.label_en}
      >
        {meta.icon}
      </a>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position:       "absolute",
          bottom:         "calc(100% + 6px)",
          left:           "50%",
          transform:      "translateX(-50%)",
          padding:        "3px 8px",
          background:     "rgba(232,220,202,0.95)",
          color:          "#38040E",
          fontSize:       "9px",
          letterSpacing:  "0.1em",
          textTransform:  "uppercase",
          whiteSpace:     "nowrap",
          pointerEvents:  "none",
          zIndex:         10,
        }}>
          {isAr ? meta.label_ar : meta.label_en}
        </div>
      )}
    </div>
  );
}

export default function ContactPage() {
  const { lang }   = useStore();
  const social     = useSocial();
  const isAr       = lang === "ar";
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!form.name || !form.email || !form.message) {
      toast.error(isAr ? "يرجى ملء جميع الحقول" : "Please fill all fields");
      return;
    }
    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...form, created_at: serverTimestamp(), read: false,
      });
      toast.success(isAr ? "تم إرسال رسالتك ✓" : "Message sent ✓");
      setForm({ name: "", email: "", message: "" });
    } catch {
      toast.error(isAr ? "حدث خطأ" : "Error, try again");
    } finally {
      setSending(false);
    }
  }

  const visibleSocial = social
    ? Object.entries(social).filter(([, v]: any) => v.visible && v.url)
    : [];

  return (
    <>
      <Navbar />
      <main className="pt-[72px] min-h-screen" dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div style={{ background: "#38040E", color: "#E8DCCA", padding: "56px 0", textAlign: "center" }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
              fontSize:   "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: isAr ? 700 : 600,
            }}
          >
            {isAr ? "تواصل معنا" : "Contact Us"}
          </motion.h1>
        </div>

        <div className="section-container py-16 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

            {/* ── Form ─────────────────────────────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h2 style={{
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontSize:   "1.4rem",
                fontWeight: isAr ? 700 : 600,
                color:      "var(--color-text)",
                marginBottom: "24px",
              }}>
                {isAr ? "أرسل رسالة" : "Send a Message"}
              </h2>

              <div className="flex flex-col gap-4">
                {[
                  { key: "name",  ar: "الاسم",              en: "Name",  type: "text"  },
                  { key: "email", ar: "البريد الإلكتروني",  en: "Email", type: "email" },
                ].map(({ key, ar, en, type }) => (
                  <div key={key}>
                    <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, marginBottom: "6px" }}>
                      {isAr ? ar : en}
                    </label>
                    <input
                      type={type}
                      value={(form as any)[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, marginBottom: "6px" }}>
                    {isAr ? "الرسالة" : "Message"}
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none", resize: "none", fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: sending ? 0.6 : 1, transition: "opacity 0.2s" }}
                >
                  <Send size={14} strokeWidth={1.5} />
                  {sending ? "..." : isAr ? "إرسال" : "Send"}
                </button>
              </div>
            </motion.div>

            {/* ── Social — same style as Footer ────── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <h2 style={{
                fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
                fontSize:   "1.4rem",
                fontWeight: isAr ? 700 : 600,
                color:      "var(--color-text)",
                marginBottom: "24px",
              }}>
                {isAr ? "تابعنا" : "Follow Us"}
              </h2>

              {/* ── Card with red background — same as footer strip ── */}
              <div style={{ background: "#38040E", padding: "28px 24px" }}>
                {visibleSocial.length > 0 ? (
                  <>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
                      {visibleSocial.map(([key, v]: any) => (
                        <SocialIcon key={key} platform={key} url={v.url} isAr={isAr} />
                      ))}
                    </div>

                    {/* Platform names list */}
                    <div style={{ borderTop: "1px solid rgba(232,220,202,0.15)", paddingTop: "16px" }}>
                      {visibleSocial.map(([key, v]: any) => {
                        const meta = SOCIAL_META[key];
                        if (!meta) return null;
                        return (
                          <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                            <span style={{ color: "#E8DCCA", opacity: 0.6, flexShrink: 0 }}>{meta.icon}</span>
                            <span style={{ fontSize: "13px", color: "#E8DCCA", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}>
                              {isAr ? meta.label_ar : meta.label_en}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: "13px", color: "#E8DCCA", opacity: 0.4 }}>
                    {isAr ? "لم يتم إضافة حسابات بعد" : "No accounts added yet"}
                  </p>
                )}
              </div>

              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "13px", color: "var(--color-text)", opacity: 0.4, lineHeight: 1.8, fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}>
                  {isAr
                    ? "للاستفسارات والشراكات، تواصل معنا عبر النموذج أو حساباتنا."
                    : "For inquiries and partnerships, reach us through the form or our accounts."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
