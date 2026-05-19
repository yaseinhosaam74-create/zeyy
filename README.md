# زِيّ | zeyy — Project Setup Guide

## 📁 Project Structure

```
zeyy/
├── public/
│   ├── manifest.json           ← PWA manifest
│   └── assets/
│       ├── brand/              ← ضع هنا: logo, favicon, app icons
│       │   ├── favicon.ico
│       │   ├── apple-touch-icon.png
│       │   ├── icon-192.png
│       │   └── icon-512.png
│       ├── og/                 ← صور المشاركة على السوشيال
│       │   └── og-image.jpg    (1200×630)
│       ├── placeholders/       ← صور احتياطية
│       │   └── product.jpg
│       └── textures/           ← grain.png (اختياري)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout (PWA + SEO)
│   │   ├── globals.css         ← Design system + CSS variables
│   │   ├── page.tsx            ← Home page
│   │   ├── shop/page.tsx       ← (todo)
│   │   ├── product/[id]/       ← (todo)
│   │   ├── cart/page.tsx       ← (todo)
│   │   ├── checkout/page.tsx   ← (todo)
│   │   ├── about/page.tsx      ← (todo)
│   │   └── zeyy.manger.7474/   ← Admin dashboard ⚡
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── Providers.tsx       ← Theme + Maintenance gate
│   │   ├── Navbar.tsx          ← Navigation
│   │   ├── Footer.tsx          ← Footer
│   │   ├── CartDrawer.tsx      ← Sliding cart
│   │   ├── ProductCard.tsx     ← Product card
│   │   └── MaintenancePage.tsx ← Maintenance screen
│   │
│   ├── hooks/
│   │   └── useFirestore.ts     ← Firebase real-time hooks
│   │
│   ├── lib/
│   │   ├── firebase.ts         ← Firebase init
│   │   └── firestore-schema.ts ← DB structure + seed function
│   │
│   ├── store/
│   │   └── useStore.ts         ← Zustand global state
│   │
│   └── middleware.ts           ← Route protection
│
├── .env.example                ← Copy to .env.local
├── next.config.js              ← Next.js + PWA config
├── tailwind.config.ts          ← Design tokens
├── tsconfig.json
└── package.json
```

---

## 🚀 Quick Start

### 1. تثبيت المشروع

```bash
cd zeyy
npm install
```

### 2. إعداد Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد باسم `zeyy`
3. فعّل **Firestore Database** (في Production mode)
4. فعّل **Storage**
5. فعّل **Authentication** → Email/Password
6. أنشئ حساب أدمن: Authentication → Users → Add user
7. انسخ إعدادات المشروع من Project Settings

### 3. إعداد متغيرات البيئة

```bash
cp .env.example .env.local
# ثم افتح .env.local وأضف قيم Firebase
```

### 4. تهيئة قاعدة البيانات (مرة واحدة فقط)

أضف هذا الكود مؤقتاً في أي صفحة ثم احذفه بعد التشغيل:

```typescript
import { initializeFirestore } from "@/lib/firestore-schema";
// في useEffect أو server action:
await initializeFirestore();
```

### 5. تشغيل المشروع

```bash
npm run dev
```

الموقع: http://localhost:3000
لوحة التحكم: http://localhost:3000/zeyy.manger.7474

---

## 🔐 Firestore Security Rules

ضع هذه القواعد في Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Settings, sections, content — read by all, write by admin only
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /sections/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /content/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Products — read by all, write by admin
    match /products/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders — read/write by owner or admin
    match /orders/{doc} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 📱 PWA Icons Setup

ضع أيقونات بهذه المقاسات في `/public/assets/brand/`:
- icon-72.png
- icon-96.png
- icon-128.png
- icon-144.png
- icon-152.png
- icon-192.png
- icon-384.png
- icon-512.png
- apple-touch-icon.png (180×180)
- favicon.ico

---

## 🏗️ What's Done

- [x] Next.js 14 + TypeScript setup
- [x] Tailwind CSS with Zeyy design tokens
- [x] Firebase integration (Auth + Firestore + Storage)
- [x] PWA manifest + next-pwa
- [x] Global state (Zustand — cart, language, UI)
- [x] Light/Dark mode with dynamic brand colors
- [x] Maintenance mode (real-time from admin)
- [x] Navbar (responsive + mobile menu)
- [x] Cart Drawer (sliding, animated)
- [x] Footer (dynamic social links)
- [x] Home page (animated hero + featured products)
- [x] Product Card (hover image swap + quick add)
- [x] Admin Dashboard (sections, content, theme, social, maintenance)
- [x] Middleware (route protection)

## 🔜 Next Steps

- [ ] Shop page with filters
- [ ] Product detail page
- [ ] Checkout + payment
- [ ] Orders tracking
- [ ] About page
- [ ] AI Sizing Advisor
- [ ] Virtual Try-On
- [ ] Push notifications
