"use client";
// src/app/setup/page.tsx
// صفحة مؤقتة لتهيئة قاعدة البيانات — احذفها بعد الاستخدام

import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SetupPage() {
  const [status, setStatus] = useState("");
  const [done, setDone]     = useState(false);

  async function initDB() {
    setStatus("جاري التهيئة...");
    try {
      // Settings - Theme
      await setDoc(doc(db, "settings", "theme"), {
        light_bg:   "#E8DCCA",
        light_text: "#38040E",
        dark_bg:    "#1A2238",
        dark_text:  "#E8DCCA",
        accent:     "#305252",
      });
      setStatus("✓ Theme");

      // Settings - Maintenance
      await setDoc(doc(db, "settings", "maintenance"), {
        is_active:      false,
        message_ar:     "الموقع تحت الصيانة، نعود قريباً ✨",
        message_en:     "We're polishing things up. Back soon ✨",
        estimated_time: "",
      });
      setStatus("✓ Maintenance");

      // Settings - Social
      await setDoc(doc(db, "settings", "social"), {
        instagram: { url: "", visible: true,  order: 1 },
        tiktok:    { url: "", visible: true,  order: 2 },
        snapchat:  { url: "", visible: false, order: 3 },
        twitter:   { url: "", visible: false, order: 4 },
      });
      setStatus("✓ Social");

      // Sections
      const sections = [
        { id: "hoodies",    data: { visible: true,  order: 1, name_ar: "الهوديز",       name_en: "Hoodies",    slug: "hoodies",    gender: "unisex" } },
        { id: "tshirts",    data: { visible: true,  order: 2, name_ar: "التيشيرتات",    name_en: "T-Shirts",   slug: "tshirts",    gender: "unisex" } },
        { id: "sweatpants", data: { visible: true,  order: 3, name_ar: "السويت بانتس",  name_en: "Sweatpants", slug: "sweatpants", gender: "unisex" } },
        { id: "limited",    data: { visible: true,  order: 4, name_ar: "إصدار محدود",   name_en: "Limited Ed.",slug: "limited",    gender: "unisex" } },
        { id: "basics",     data: { visible: true,  order: 5, name_ar: "البيزك",        name_en: "Basics",     slug: "basics",     gender: "unisex" } },
      ];
      for (const s of sections) {
        await setDoc(doc(db, "sections", s.id), s.data);
      }
      setStatus("✓ Sections");

      // Content - Home
      await setDoc(doc(db, "content", "home"), {
        hero_title_ar:    "الأصالة في كل خيط",
        hero_title_en:    "Authenticity in Every Thread",
        hero_subtitle_ar: "أسلوب هادئ. جودة تتكلم.",
        hero_subtitle_en: "Quiet style. Quality speaks.",
        hero_cta_ar:      "اكتشف المجموعة",
        hero_cta_en:      "Explore the Collection",
        featured_title_ar:"المجموعة الجديدة",
        featured_title_en:"New Collection",
        about_teaser_ar:  "مصنوع بهدوء، لمن يعرف قيمة التفاصيل.",
        about_teaser_en:  "Crafted quietly, for those who notice.",
      });
      setStatus("✓ Home Content");

      // Content - Footer
      await setDoc(doc(db, "content", "footer"), {
        tagline_ar: "زِيّ — الفخامة الهادئة",
        tagline_en: "zeyy — Quiet Luxury",
        rights_ar:  "جميع الحقوق محفوظة",
        rights_en:  "All rights reserved",
      });
      setStatus("✓ Footer Content");

      // Content - About
      await setDoc(doc(db, "content", "about"), {
        title_ar: "قصتنا",
        title_en: "Our Story",
        body_ar:  "زِيّ ليست مجرد ملابس، هي موقف. نصنع قطعاً تعيش معك وتعبّر عنك بهدوء وأصالة.",
        body_en:  "zeyy is not just clothing, it's an attitude. We craft pieces that live with you and express you quietly and authentically.",
      });

      setStatus("✅ تمت التهيئة بنجاح!");
      setDone(true);
    } catch (err: any) {
      setStatus("❌ خطأ: " + err.message);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#38040E", color: "#E8DCCA", fontFamily: "Cormorant Garamond, serif", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>zeyy — Database Setup</h1>
      <p style={{ opacity: 0.6, marginBottom: "2rem", fontSize: "0.9rem" }}>
        اضغط مرة واحدة فقط لتهيئة قاعدة البيانات
      </p>

      {!done ? (
        <button
          onClick={initDB}
          style={{ background: "#E8DCCA", color: "#38040E", border: "none", padding: "1rem 3rem", fontSize: "1rem", cursor: "pointer", letterSpacing: "0.15em" }}
        >
          ابدأ التهيئة
        </button>
      ) : (
        <a href="/" style={{ color: "#E8DCCA", textDecoration: "underline", marginTop: "1rem" }}>
          العودة للموقع
        </a>
      )}

      {status && (
        <p style={{ marginTop: "1.5rem", opacity: 0.8, fontSize: "1rem" }}>{status}</p>
      )}

      <p style={{ marginTop: "3rem", opacity: 0.3, fontSize: "0.75rem" }}>
        ⚠️ احذف هذه الصفحة بعد الاستخدام
      </p>
    </div>
  );
}
