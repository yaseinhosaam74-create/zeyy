"use client";
// src/app/account/page.tsx

import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged,
  updateProfile, deleteUser, type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db }   from "@/lib/firebase";
import { useRouter }  from "next/navigation";
import toast          from "react-hot-toast";
import Image          from "next/image";
import Link           from "next/link";
import Navbar         from "@/components/Navbar";
import Footer         from "@/components/Footer";
import { useStore }   from "@/store/useStore";
import { LogOut, ShoppingBag, ChevronLeft, Trash2, AlertTriangle } from "lucide-react";

const googleProvider = new GoogleAuthProvider();

type Tab = "login" | "register";

export default function AccountPage() {
  const { lang }                   = useStore();
  const router                     = useRouter();
  const isAr                       = lang === "ar";
  const [user,     setUser]        = useState<User | null>(null);
  const [loading,  setLoading]     = useState(true);
  const [tab,      setTab]         = useState<Tab>("login");
  const [submitting,setSubmitting] = useState(false);
  const [showDelete,setShowDelete] = useState(false);
  const [form,     setForm]        = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return () => unsub();
  }, []);

  function update(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function handleLogin() {
    if (!form.email || !form.password) { toast.error(isAr ? "أدخل البريد وكلمة السر" : "Enter email & password"); return; }
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      toast.success(isAr ? "مرحباً بك ✓" : "Welcome back ✓");
    } catch { toast.error(isAr ? "البيانات غير صحيحة" : "Invalid credentials"); }
    finally { setSubmitting(false); }
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) { toast.error(isAr ? "أكمل جميع الحقول" : "Fill all fields"); return; }
    if (form.password.length < 6) { toast.error(isAr ? "كلمة السر 6 أحرف على الأقل" : "Password min 6 chars"); return; }
    setSubmitting(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(cred.user, { displayName: form.name });
      await setDoc(doc(db, "users", cred.user.uid), { name: form.name, email: form.email, created_at: serverTimestamp(), role: "customer" });
      toast.success(isAr ? "تم إنشاء الحساب ✓" : "Account created ✓");
    } catch (err: any) {
      toast.error(err.code === "auth/email-already-in-use" ? (isAr ? "البريد مستخدم بالفعل" : "Email already in use") : (isAr ? "حدث خطأ" : "An error occurred"));
    } finally { setSubmitting(false); }
  }

  async function handleGoogle() {
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u      = result.user;
      const ref    = doc(db, "users", u.uid);
      const snap   = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { name: u.displayName, email: u.email, photo: u.photoURL, created_at: serverTimestamp(), role: "customer" });
      }
      toast.success(isAr ? "تم الدخول بنجاح ✓" : "Signed in ✓");
    } catch { toast.error(isAr ? "فشل الدخول بجوجل" : "Google sign in failed"); }
    finally { setSubmitting(false); }
  }

  async function handleLogout() {
    await signOut(auth);
    toast.success(isAr ? "تم تسجيل الخروج" : "Signed out");
  }

  async function handleDeleteAccount() {
    if (!user) return;
    try {
      // Delete user data from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      // Delete Firebase auth account
      await deleteUser(user);
      toast.success(isAr ? "تم حذف الحساب نهائياً" : "Account deleted permanently");
      router.push("/");
    } catch (err: any) {
      if (err.code === "auth/requires-recent-login") {
        toast.error(isAr ? "أعد تسجيل الدخول أولاً ثم احذف الحساب" : "Please re-login first, then delete your account");
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    }
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="w-1 h-12 animate-pulse" style={{ background: "var(--color-text)" }} />
      </div>
    </>
  );

  // ── Logged in ──────────────────────────────────────────
  if (user) return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px]" dir={isAr ? "rtl" : "ltr"}>
        <div className="section-container py-16 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

            {/* Profile */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
              {user.photoURL ? (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <Image src={user.photoURL} alt="" width={64} height={64} style={{ objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#38040E", display: "flex", alignItems: "center", justifyContent: "center", color: "#E8DCCA", fontSize: "1.5rem", fontFamily: "Cormorant Garamond, serif", fontWeight: 600, flexShrink: 0 }}>
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "Z"}
                </div>
              )}
              <div>
                <h1 style={{ fontSize: "1.2rem", fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, color: "var(--color-text)" }}>
                  {user.displayName || (isAr ? "مرحباً" : "Welcome")}
                </h1>
                <p style={{ fontSize: "12px", color: "var(--color-text)", opacity: 0.4, marginTop: "3px" }}>{user.email}</p>
              </div>
            </div>

            {/* Menu */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "32px" }}>
              <Link href="/orders"
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 18px", border: "1px solid var(--color-border)", textDecoration: "none", color: "var(--color-text)", transition: "background 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--color-border)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <ShoppingBag size={16} strokeWidth={1.5} style={{ opacity: 0.6, flexShrink: 0 }} />
                <span style={{ fontSize: "14px" }}>{isAr ? "طلباتي" : "My Orders"}</span>
                <ChevronLeft size={14} style={{ marginInlineStart: "auto", opacity: 0.3, transform: isAr ? "scaleX(1)" : "scaleX(-1)" }} />
              </Link>
            </div>

            {/* Logout + Delete */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button onClick={handleLogout}
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.45, background: "none", border: "none", cursor: "pointer" }}>
                <LogOut size={14} strokeWidth={1.5} />
                {isAr ? "تسجيل الخروج" : "Sign Out"}
              </button>

              <button onClick={() => setShowDelete(true)}
                style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#c0392b", opacity: 0.6, background: "none", border: "none", cursor: "pointer" }}>
                <Trash2 size={14} strokeWidth={1.5} />
                {isAr ? "حذف الحساب نهائياً" : "Delete Account Permanently"}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Delete confirmation */}
        <AnimatePresence>
          {showDelete && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
              onClick={() => setShowDelete(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", padding: "28px", maxWidth: "380px", width: "100%" }}
                onClick={e => e.stopPropagation()} dir={isAr ? "rtl" : "ltr"}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <AlertTriangle size={20} color="#c0392b" />
                  <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)" }}>
                    {isAr ? "حذف الحساب نهائياً" : "Delete Account Permanently"}
                  </h2>
                </div>
                <p style={{ fontSize: "13px", color: "var(--color-text)", opacity: 0.6, lineHeight: 1.7, marginBottom: "24px" }}>
                  {isAr
                    ? "سيتم حذف حسابك وجميع بياناتك نهائياً. هذا الإجراء لا يمكن التراجع عنه."
                    : "Your account and all associated data will be permanently deleted. This action cannot be undone."}
                </p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={handleDeleteAccount}
                    style={{ flex: 1, padding: "12px", background: "#c0392b", color: "#fff", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    {isAr ? "نعم، احذف حسابي" : "Yes, Delete My Account"}
                  </button>
                  <button onClick={() => setShowDelete(false)}
                    style={{ padding: "12px 20px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", cursor: "pointer", fontSize: "12px" }}>
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </>
  );

  // ── Auth forms ──────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[72px] flex items-center justify-center px-4" dir={isAr ? "rtl" : "ltr"}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="w-full max-w-sm">
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1 style={{ fontFamily: isAr ? "Aref Ruqaa, serif" : "Cormorant Garamond, serif", fontWeight: isAr ? 700 : 600, fontSize: "2.5rem", color: "var(--color-text)" }}>
              {isAr ? "زِيّ" : "zeyy"}
            </h1>
            <p style={{ fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, marginTop: "6px" }}>
              {isAr ? "حسابي" : "My Account"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--color-border)", marginBottom: "28px" }}>
            {(["login", "register"] as Tab[]).map(t_ => (
              <button key={t_} onClick={() => setTab(t_)}
                style={{ flex: 1, padding: "12px", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-text)", borderBottom: tab === t_ ? "2px solid var(--color-text)" : "2px solid transparent", opacity: tab === t_ ? 1 : 0.4, background: "none", border: "none", cursor: "pointer", borderBottom: tab === t_ ? "2px solid var(--color-text)" : "2px solid transparent" } as any}>
                {t_ === "login" ? (isAr ? "دخول" : "Sign In") : (isAr ? "حساب جديد" : "Register")}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {tab === "register" && (
              <div>
                <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, marginBottom: "6px" }}>
                  {isAr ? "الاسم" : "Name"}
                </label>
                <input type="text" value={form.name} onChange={e => update("name", e.target.value)}
                  style={{ width: "100%", padding: "12px 16px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, marginBottom: "6px" }}>
                {isAr ? "البريد الإلكتروني" : "Email"}
              </label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
                onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
                style={{ width: "100%", padding: "12px 16px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-text)", opacity: 0.4, marginBottom: "6px" }}>
                {isAr ? "كلمة السر" : "Password"}
              </label>
              <input type="password" value={form.password} onChange={e => update("password", e.target.value)}
                onKeyDown={e => e.key === "Enter" && (tab === "login" ? handleLogin() : handleRegister())}
                style={{ width: "100%", padding: "12px 16px", fontSize: "14px", background: "transparent", border: "1px solid var(--color-border)", color: "var(--color-text)", outline: "none" }} />
            </div>

            <button onClick={tab === "login" ? handleLogin : handleRegister} disabled={submitting}
              style={{ width: "100%", padding: "14px", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", opacity: submitting ? 0.6 : 1, marginTop: "4px" }}>
              {submitting ? "..." : tab === "login" ? (isAr ? "دخول" : "Sign In") : (isAr ? "إنشاء حساب" : "Create Account")}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
              <span style={{ fontSize: "11px", color: "var(--color-text)", opacity: 0.3 }}>{isAr ? "أو" : "or"}</span>
              <div style={{ flex: 1, height: "1px", background: "var(--color-border)" }} />
            </div>

            <button onClick={handleGoogle} disabled={submitting}
              style={{ width: "100%", padding: "13px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text)", cursor: "pointer", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", opacity: submitting ? 0.6 : 1 }}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {isAr ? "دخول بجوجل" : "Continue with Google"}
            </button>
          </div>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "var(--color-text)", opacity: 0.3 }}>
            <Link href="/shop" style={{ color: "inherit", textDecoration: "underline" }}>
              {isAr ? "تصفح كزائر" : "Browse as guest"}
            </Link>
          </p>
        </motion.div>
      </main>
    </>
  );
}

// Need AnimatePresence imported
import { AnimatePresence } from "framer-motion";
