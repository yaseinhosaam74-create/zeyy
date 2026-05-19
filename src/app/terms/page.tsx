"use client";
// src/app/terms/page.tsx

import { motion }   from "framer-motion";
import Navbar       from "@/components/Navbar";
import Footer       from "@/components/Footer";
import { useStore } from "@/store/useStore";

export default function TermsPage() {
  const { lang, t } = useStore();
  const isAr        = lang === "ar";

  const sections_ar = [
    {
      title: "قبول الشروط",
      body: "باستخدام موقع زِيّ، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام موقعنا.",
    },
    {
      title: "الطلبات والدفع",
      body: "جميع الطلبات تخضع لتوفر المخزون. نحتفظ بالحق في رفض أو إلغاء أي طلب. الأسعار مدرجة بالريال السعودي وقد تتغير دون إشعار مسبق.",
    },
    {
      title: "الشحن والتوصيل",
      body: "نوفر خدمة الشحن داخل المملكة العربية السعودية. أوقات التوصيل تقديرية وليست مضمونة. لسنا مسؤولين عن التأخيرات الناتجة عن شركات الشحن.",
    },
    {
      title: "الإرجاع والاستبدال",
      body: "يمكن إرجاع المنتجات خلال ١٤ يوماً من تاريخ الاستلام بشرط أن تكون بحالتها الأصلية وغير مستخدمة. المنتجات المخفضة غير قابلة للإرجاع.",
    },
    {
      title: "الملكية الفكرية",
      body: "جميع المحتويات على هذا الموقع، بما في ذلك الشعارات والصور والنصوص، هي ملكية حصرية لزِيّ ومحمية بموجب قوانين الملكية الفكرية.",
    },
    {
      title: "حدود المسؤولية",
      body: "لن تكون زِيّ مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام أو عدم القدرة على استخدام منتجاتنا أو خدماتنا.",
    },
    {
      title: "التعديلات",
      body: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على موقعنا.",
    },
  ];

  const sections_en = [
    {
      title: "Acceptance of Terms",
      body: "By using the zeyy website, you agree to be bound by these Terms and Conditions. If you do not agree to any of these terms, please do not use our website.",
    },
    {
      title: "Orders & Payment",
      body: "All orders are subject to product availability. We reserve the right to refuse or cancel any order. Prices are listed in Saudi Riyal and may change without prior notice.",
    },
    {
      title: "Shipping & Delivery",
      body: "We provide shipping within Saudi Arabia. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping companies.",
    },
    {
      title: "Returns & Exchanges",
      body: "Products can be returned within 14 days of receipt, provided they are in their original condition and unused. Sale items are non-returnable.",
    },
    {
      title: "Intellectual Property",
      body: "All content on this website, including logos, images, and text, is the exclusive property of zeyy and is protected by intellectual property laws.",
    },
    {
      title: "Limitation of Liability",
      body: "zeyy shall not be liable for any direct or indirect damages resulting from the use or inability to use our products or services.",
    },
    {
      title: "Modifications",
      body: "We reserve the right to modify these terms at any time. You will be notified of any material changes via email or through a prominent notice on our website.",
    },
  ];

  const sections = isAr ? sections_ar : sections_en;

  return (
    <>
      <Navbar />
      <main className="pt-[72px]" dir={isAr ? "rtl" : "ltr"}>

        {/* Header */}
        <div className="py-16 text-center" style={{ background: "var(--brand-midnight)", color: "#E8DCCA" }}>
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
            {t("الشروط والأحكام", "Terms & Conditions")}
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
                  {`${i + 1}. ${s.title}`}
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
