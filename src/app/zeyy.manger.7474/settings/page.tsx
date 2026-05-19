"use client";
// src/app/zeyy.manger.7474/settings/page.tsx
// ─── Admin Settings ───────────────────────────────────────

import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import { Save, Phone, MessageCircle, Store, Mail } from "lucide-react";

const S = {
  bg: "#0f1117", surface: "#161b27", border: "rgba(255,255,255,0.07)",
  text: "#e8dcca", red: "#38040E",
  input: { background: "#161b27", border: "1px solid rgba(255,255,255,0.07)", color: "#e8dcca", padding: "10px 14px", fontSize: "13px", outline: "none", width: "100%" } as React.CSSProperties,
};

interface Settings {
  store_name_ar:     string;
  store_name_en:     string;
  store_email:       string;
  whatsapp_number:   string;
  whatsapp_message_ar: string;
  whatsapp_message_en: string;
  cancel_whatsapp_msg_ar: string;
  cancel_whatsapp_msg_en: string;
  order_deleted_sms_ar: string;
  order_deleted_sms_en: string;
  currency_ar:       string;
  currency_en:       string;
}

const DEFAULTS: Settings = {
  store_name_ar:     "زِيّ",
  store_name_en:     "zeyy",
  store_email:       "",
  whatsapp_number:   "01121454510",
  whatsapp_message_ar: "مرحباً، أريد الاستفسار عن طلبي 🛍️",
  whatsapp_message_en: "Hello, I need help with my order 🛍️",
  cancel_whatsapp_msg_ar: "مرحباً، أريد إلغاء طلبي رقم: {order_id}",
  cancel_whatsapp_msg_en: "Hello, I want to cancel my order: {order_id}",
  order_deleted_sms_ar: "عزيزي العميل، تم إلغاء طلبك رقم {order_id} من قِبل المتجر. للاستفسار تواصل معنا عبر واتساب.",
  order_deleted_sms_en: "Dear customer, your order {order_id} has been cancelled by the store. Contact us on WhatsApp for more info.",
  currency_ar:       "ج.م",
  currency_en:       "EGP",
};

export default function SettingsPanel() {
  const [data, setData]   = useState<Settings>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "store"), (snap) => {
      if (snap.exists()) setData({ ...DEFAULTS, ...snap.data() } as Settings);
    });
    return () => unsub();
  }, []);

  function set(k: keyof Settings, v: string) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "store"), data, { merge: true });
      toast.success("✓ Settings saved");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const label = (txt: string) => (
    <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: S.text, opacity: 0.4, marginBottom: "6px" }}>
      {txt}
    </label>
  );

  const section = (title: string, icon: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "12px", borderBottom: `1px solid ${S.border}` }}>
      <div style={{ color: "#38040E", opacity: 0.8 }}>{icon}</div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: S.text }}>{title}</p>
    </div>
  );

  return (
    <div style={{ maxWidth: "600px" }}>
      <h2 style={{ fontSize: "16px", fontWeight: 600, color: S.text, marginBottom: "28px" }}>⚙️ Store Settings</h2>

      {/* Store Info */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "20px", marginBottom: "16px" }}>
        {section("Store Information", <Store size={16} />)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>{label("اسم المتجر (عربي)")}<input value={data.store_name_ar} onChange={e => set("store_name_ar", e.target.value)} style={{ ...S.input, direction: "rtl", fontFamily: "Aref Ruqaa, serif" }} /></div>
          <div>{label("Store Name (EN)")}<input value={data.store_name_en} onChange={e => set("store_name_en", e.target.value)} style={S.input} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>{label("Currency (AR)")}<input value={data.currency_ar} onChange={e => set("currency_ar", e.target.value)} style={S.input} placeholder="ج.م" /></div>
          <div>{label("Currency (EN)")}<input value={data.currency_en} onChange={e => set("currency_en", e.target.value)} style={S.input} placeholder="EGP" /></div>
        </div>
      </div>

      {/* WhatsApp Support */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "20px", marginBottom: "16px" }}>
        {section("WhatsApp Support", <MessageCircle size={16} />)}
        <div style={{ marginBottom: "12px" }}>
          {label("WhatsApp Number (with country code)")}
          <input value={data.whatsapp_number} onChange={e => set("whatsapp_number", e.target.value)} style={S.input} placeholder="01121454510" />
          <p style={{ fontSize: "10px", color: S.text, opacity: 0.25, marginTop: "4px" }}>Without + or spaces. e.g. 201121454510 for Egypt</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div>{label("رسالة الدعم (عربي)")}<textarea value={data.whatsapp_message_ar} onChange={e => set("whatsapp_message_ar", e.target.value)} rows={3} style={{ ...S.input, resize: "none", direction: "rtl", fontFamily: "Aref Ruqaa, serif" }} /></div>
          <div>{label("Support Message (EN)")}<textarea value={data.whatsapp_message_en} onChange={e => set("whatsapp_message_en", e.target.value)} rows={3} style={{ ...S.input, resize: "none" }} /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            {label("رسالة إلغاء الطلب (عربي)")}
            <textarea value={data.cancel_whatsapp_msg_ar} onChange={e => set("cancel_whatsapp_msg_ar", e.target.value)} rows={3} style={{ ...S.input, resize: "none", direction: "rtl", fontFamily: "Aref Ruqaa, serif" }} />
            <p style={{ fontSize: "9px", color: S.text, opacity: 0.2, marginTop: "3px" }}>Use {"{order_id}"} for order number</p>
          </div>
          <div>
            {label("Cancel Order Message (EN)")}
            <textarea value={data.cancel_whatsapp_msg_en} onChange={e => set("cancel_whatsapp_msg_en", e.target.value)} rows={3} style={{ ...S.input, resize: "none" }} />
          </div>
        </div>
      </div>

      {/* Delete Order Notification */}
      <div style={{ background: S.surface, border: `1px solid ${S.border}`, padding: "20px", marginBottom: "20px" }}>
        {section("Order Deletion Message", <Mail size={16} />)}
        <p style={{ fontSize: "11px", color: S.text, opacity: 0.35, marginBottom: "12px" }}>
          This message is sent to customer when you delete their order. Use {"{order_id}"} and {"{customer_name}"}.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>{label("رسالة الحذف (عربي)")}<textarea value={data.order_deleted_sms_ar} onChange={e => set("order_deleted_sms_ar", e.target.value)} rows={4} style={{ ...S.input, resize: "none", direction: "rtl", fontFamily: "Aref Ruqaa, serif" }} /></div>
          <div>{label("Deletion Message (EN)")}<textarea value={data.order_deleted_sms_en} onChange={e => set("order_deleted_sms_en", e.target.value)} rows={4} style={{ ...S.input, resize: "none" }} /></div>
        </div>
      </div>

      <button onClick={save} disabled={saving}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", width: "100%", padding: "14px", background: S.red, color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: saving ? 0.6 : 1 }}>
        <Save size={14} />
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
