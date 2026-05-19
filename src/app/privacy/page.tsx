"use client";
// src/app/privacy/page.tsx

import { motion }   from "framer-motion";
import Navbar       from "@/components/Navbar";
import Footer       from "@/components/Footer";
import { useStore } from "@/store/useStore";

export default function PrivacyPage() {
  const { lang, t } = useStore();
  const isAr        = lang === "ar";

  const sections_ar = [
    {
      title: "جمع المعلومات",
      body: "نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو تقديم طلب شراء، بما في ذلك الاسم وعنوان البريد الإلكتروني وعنوان الشحن وبيانات الدفع.",
    },
    {
      title: "استخدام المعلومات",
      body: "نستخدم المعلومات التي نجمعها لمعالجة طلباتك وإرسال تأكيدات الطلبات وتحديثات الشحن والرد على استفساراتك وتحسين خدماتنا.",
    },
    {
      title: "حماية المعلومات",
      body: "نحن نتخذ تدابير أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التغيير أو الإفصاح أو الإتلاف.",
    },
    {
      title: "مشاركة المعلومات",
      body: "لا نبيع أو نتاجر أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط مع مزودي الخدمات الذين يساعدوننا في تشغيل متجرنا.",
    },
    {
      title: "ملفات الكوكيز",
      body: "نستخدم ملفات الكوكيز لتحسين تجربتك على موقعنا وتحليل حركة المرور. يمكنك التحكم في ملفات الكوكيز من إعدادات متصفحك.",
    },
    {
      title: "التواصل معنا",
      body: "إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يمكنك التواصل معنا عبر صفحة التواصل.",
    },
  ];

  const sections_en = [
    {
      title: "Information Collection",
      body: "We collect information you provide directly to us, such as when creating an account or placing an order, including your name, email address, shipping address, and payment details.",
    },
    {
      title: "Use of Information",
      body: "We use the information we collect to process your orders, send order confirmations and shipping updates, respond to your inquiries, and improve our services.",
    },
    {
      title: "Information Protection",
      body: "We take appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.",
    },
    {
      title: "Information Sharing",
      body: "We do not sell, trade, or rent your personal information to third parties. We may share your information only with service providers who assist us in operating our store.",
    },
    {
      title: "Cookies",
      body: "We use cookies to improve your experience on our website and analyze traffic. You can control cookies through your browser settings.",
    },
    {
      title: "Contact Us",
      body: "If you have any questions about this Privacy Policy, you can contact us through the contact page.",
    },
  ];

  const sections = isAr ? sections_ar : sections_en;

  return (
    <>
      <Navbar />
      <main className="pt-[72px]" dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="py-16 text-center" style={{ background: "var(--brand-hero-red)", color: "#E8DCCA" }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif",
              fontSize: "clamp(1.8rem, 4vw, 3.5rem)",
              fontWeight: isAr ? 700 : 600,
            }}
          >
            {t("سياسة الخصوصية", "Privacy Policy")}
          </motion.h1>
          <p className="mt-3 text-xs opacity-40 tracking-widest">
            {t("آخر تحديث: يناير ٢٠٢٥", "Last updated: January 2025")}
          </p>
        </div>

        {/* Content */}
        <div className="section-container max-w-2xl py-16">
          <div className="flex flex-col gap-10">
            {sections.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <h2
                  className="text-lg font-semibold mb-3"
                  style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}
                >
                  {s.title}
                </h2>
                <p
                  className="text-sm leading-relaxed opacity-60"
                  style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "inherit" }}
                >
                  {s.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
