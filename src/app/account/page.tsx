"use client";
// src/app/account/page.tsx

import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db }   from "@/lib/firebase";
import { useRouter }  from "next/navigation";
import toast          from "react-hot-toast";
import Navbar         from "@/components/Navbar";
import Footer         from "@/components/Footer";
import { useStore }   from "@/store/useStore";
import { LogOut, User as UserIcon, ShoppingBag, ChevronLeft } from "lucide-react";
import Link           from "next/link";

const googleProvider = new GoogleAuthProvider();

type Tab = "login" | "register";

export default function AccountPage() {
  const { lang, t }                = useStore();
  const router                     = useRouter();
  const isAr                       = lang === "ar";
  const [user,     setUser]        = useState<User | null>(null);
  const [loading,  setLoading]     = useState(true);
  const [tab,      setTab]         = useState<Tab>("login");
  const [submitting, setSubmitting]= useState(false);
  const [form, setForm]            = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function update(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // ── Login ─────────────────────────────────────────────
  async function handleLogin() {
    if (!form.email || !form.password) {
      toast.error(isAr ? "أدخل البريد وكلمة السر" : "Enter email & password");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success(isAr ? "مرحباً بك ✓" : "Welcome back ✓");
    } catch {
      toast.error(isAr ? "البيانات غير صحيحة" : "Invalid credentials");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Register ──────────────────────────────────────────
  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      toast.error(isAr ? "أكمل جميع الحقول" : "Fill all fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error(isAr ? "كلمة السر 6 أحرف على الأقل" : "Password min 6 chars");
      return;
    }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name:       form.name,
        email:      form.email,
        created_at: serverTimestamp(),
        role:       "customer",
      });
      toast.success(isAr ? "تم إنشاء الحساب ✓" : "Account created ✓");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        toast.error(isAr ? "البريد مستخدم بالفعل" : "Email already in use");
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ── Google Sign In ────────────────────────────────────
  async function handleGoogle() {
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u      = result.user;
      // Save user to Firestore if new
      const ref  = doc(db, "users", u.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { name: u.displayName, email: u.email, created_at: serverTimestamp(), role: "customer" });
      }
      toast.success(isAr ? "تم الدخول بنجاح ✓" : "Signed in ✓");
    } catch {
      toast.error(isAr ? "فشل تسجيل الدخول بجوجل" : "Google sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Logout ────────────────────────────────────────────
  async function handleLogout() {
    await signOut(auth);
    toast.success(isAr ? "تم تسجيل الخروج" : "Signed out");
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="w-1 h-12 animate-pulse" style={{ background: "var(--color-text)" }} />
      </div>
    </>
  );

  // ── Logged in ─────────────────────────────────────────
  if (user) return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" dir={isAr ? "rtl" : "ltr"}>
        <div className="section-container py-16 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                style={{ background: "var(--brand-hero-red, #38040E)", color: "#E8DCCA" }}>
                {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "Z"}
              </div>
              <div>
                <h1 className="text-xl font-semibold" style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif" }}>
                  {user.displayName || t("مرحباً", "Welcome")}
                </h1>
                <p className="text-sm opacity-40 mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Menu items */}
            <div className="flex flex-col gap-2 mb-10">
              {[
                { href: "/orders", icon: <ShoppingBag size={16} strokeWidth={1.5} />, ar: "طلباتي", en: "My Orders" },
              ].map((item) => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-4 px-5 py-4 transition-all border"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-border)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item.icon}
                  <span className="text-sm tracking-wide">{isAr ? item.ar : item.en}</span>
                  <ChevronLeft size={14} className="ms-auto opacity-30" style={{ transform: isAr ? "scaleX(1)" : "scaleX(-1)" }} />
                </Link>
              ))}
            </div>

            <button onClick={handleLogout}
              className="flex items-center gap-3 text-sm tracking-widest uppercase transition-opacity hover:opacity-60"
              style={{ color: "var(--color-text)", opacity: 0.5 }}>
              <LogOut size={15} strokeWidth={1.5} />
              {t("تسجيل الخروج", "Sign Out")}
            </button>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );

  // ── Auth Forms ────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px] flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <h1 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "2.5rem", color: "var(--color-text)" }}>
              {isAr ? "زِيّ" : "zeyy"}
            </h1>
            <p className="text-xs tracking-[0.2em] uppercase mt-2 opacity-40" style={{ color: "var(--color-text)" }}>
              {t("حسابي", "My Account")}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 border-b" style={{ borderColor: "var(--color-border)" }}>
            {(["login", "register"] as Tab[]).map((t_) => (
              <button key={t_} onClick={() => setTab(t_)}
                className="flex-1 py-3 text-xs tracking-widest uppercase transition-all"
                style={{
                  color: "var(--color-text)",
                  borderBottom: tab === t_ ? "2px solid var(--color-text)" : "2px solid transparent",
                  opacity: tab === t_ ? 1 : 0.4,
                }}>
                {t_ === "login" ? t("دخول", "Sign In") : t("حساب جديد", "Register")}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {tab === "register" && (
              <div>
                <label className="block text-xs tracking-widest uppercase opacity-40 mb-1.5" style={{ color: "var(--color-text)" }}>
                  {t("الاسم", "Name")}
                </label>
                <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
              </div>
            )}

            <div>
              <label className="block text-xs tracking-widest uppercase opacity-40 mb-1.5" style={{ color: "var(--color-text)" }}>
                {t("البريد الإلكتروني", "Email")}
              </label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase opacity-40 mb-1.5" style={{ color: "var(--color-text)" }}>
                {t("كلمة السر", "Password")}
              </label>
              <input type="password" value={form.password} onChange={(e) => update("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
                className="w-full px-4 py-3 text-sm outline-none"
                style={{ background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
            </div>

            <button
              onClick={tab === "login" ? handleLogin : handleRegister}
              disabled={submitting}
              className="w-full py-4 text-sm tracking-widest uppercase transition-opacity hover:opacity-80 disabled:opacity-50 mt-2"
              style={{ background: "#38040E", color: "#E8DCCA", letterSpacing: "0.15em" }}>
              {submitting ? "..." : tab === "login" ? t("دخول", "Sign In") : t("إنشاء حساب", "Create Account")}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-2">
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
              <span className="text-xs opacity-30" style={{ color: "var(--color-text)" }}>{t("أو", "or")}</span>
              <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={submitting}
              className="w-full py-3.5 text-sm tracking-widest uppercase transition-all hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-3 border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t("دخول بجوجل", "Continue with Google")}
            </button>
          </div>

          {/* Guest */}
          <p className="text-center mt-8 text-xs opacity-30" style={{ color: "var(--color-text)" }}>
            <Link href="/shop" className="hover:opacity-60 transition-opacity underline">
              {t("تصفح كزائر", "Browse as guest")}
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}
