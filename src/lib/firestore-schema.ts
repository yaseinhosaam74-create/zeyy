// src/lib/firestore-schema.ts
// ─────────────────────────────────────────────────────────
// ZEYY | Firestore Database Schema
// This file documents the complete database structure.
// Run initializeFirestore() once to seed default data.
// ─────────────────────────────────────────────────────────

import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// ── Types ─────────────────────────────────────────────────

export type ThemeConfig = {
  light_bg:    string;
  light_text:  string;
  dark_bg:     string;
  dark_text:   string;
  accent:      string;
};

export type MaintenanceConfig = {
  is_active:      boolean;
  message_ar:     string;
  message_en:     string;
  estimated_time: string;
};

export type SocialLink = {
  url:     string;
  visible: boolean;
  order:   number;
};

export type SectionConfig = {
  visible:  boolean;
  order:    number;
  name_ar:  string;
  name_en:  string;
  slug:     string;
};

export type ContentBlock = {
  [key: string]: string;  // key_ar / key_en
};

// ── Default Data ──────────────────────────────────────────

const DEFAULT_THEME: ThemeConfig = {
  light_bg:   "#E8DCCA",
  light_text: "#38040E",
  dark_bg:    "#1A2238",
  dark_text:  "#E8DCCA",
  accent:     "#305252",
};

const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  is_active:      false,
  message_ar:     "الموقع تحت الصيانة، نعود قريباً ✨",
  message_en:     "We're polishing things up. Back soon ✨",
  estimated_time: "",
};

const DEFAULT_SOCIAL: Record<string, SocialLink> = {
  instagram: { url: "", visible: true,  order: 1 },
  tiktok:    { url: "", visible: true,  order: 2 },
  snapchat:  { url: "", visible: false, order: 3 },
  twitter:   { url: "", visible: false, order: 4 },
};

const DEFAULT_SECTIONS: Record<string, SectionConfig> = {
  hoodies:    { visible: true,  order: 1, name_ar: "الهوديز",        name_en: "Hoodies",     slug: "hoodies"    },
  tshirts:    { visible: true,  order: 2, name_ar: "التيشيرتات",     name_en: "T-Shirts",    slug: "tshirts"    },
  sweatpants: { visible: true,  order: 3, name_ar: "السويت بانتس",   name_en: "Sweatpants",  slug: "sweatpants" },
  limited:    { visible: true,  order: 4, name_ar: "إصدار محدود",    name_en: "Limited Ed.", slug: "limited"    },
  basics:     { visible: true,  order: 5, name_ar: "البيزك",         name_en: "Basics",      slug: "basics"     },
};

const DEFAULT_CONTENT: Record<string, ContentBlock> = {
  home: {
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
  },
  footer: {
    tagline_ar: "زِيّ — الفخامة الهادئة",
    tagline_en: "zeyy — Quiet Luxury",
    rights_ar:  "جميع الحقوق محفوظة",
    rights_en:  "All rights reserved",
  },
  about: {
    title_ar:   "قصتنا",
    title_en:   "Our Story",
    body_ar:    "زِيّ ليست مجرد ملابس، هي موقف. نصنع قطعاً تعيش معك.",
    body_en:    "zeyy is not just clothing, it's an attitude. We craft pieces that live with you.",
  },
};

// ── Seed Function ─────────────────────────────────────────

export async function initializeFirestore() {
  console.log("🔥 Initializing Firestore with default Zeyy data...");

  // Settings
  await setDoc(doc(db, "settings", "theme"),       DEFAULT_THEME);
  await setDoc(doc(db, "settings", "maintenance"), DEFAULT_MAINTENANCE);
  await setDoc(doc(db, "settings", "social"),      DEFAULT_SOCIAL);

  // Sections
  for (const [key, value] of Object.entries(DEFAULT_SECTIONS)) {
    await setDoc(doc(db, "sections", key), value);
  }

  // Content
  for (const [page, content] of Object.entries(DEFAULT_CONTENT)) {
    await setDoc(doc(db, "content", page), content);
  }

  console.log("✅ Firestore initialized successfully!");
}

// ── Firestore Collection Reference Map ───────────────────
//
//  firestore/
//  ├── settings/
//  │   ├── theme          → ThemeConfig
//  │   ├── maintenance    → MaintenanceConfig
//  │   └── social         → Record<string, SocialLink>
//  ├── sections/
//  │   ├── hoodies        → SectionConfig
//  │   ├── tshirts        → SectionConfig
//  │   ├── sweatpants     → SectionConfig
//  │   └── ...
//  ├── content/
//  │   ├── home           → ContentBlock
//  │   ├── footer         → ContentBlock
//  │   ├── about          → ContentBlock
//  │   └── ...
//  ├── products/
//  │   └── {id}           → Product
//  └── orders/
//      └── {id}           → Order
