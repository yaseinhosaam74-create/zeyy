"use client";
// src/components/Providers.tsx
import { useEffect, useState } from "react";
import { Toaster }             from "react-hot-toast";
import { useStore }            from "@/store/useStore";
import { useMaintenance, useThemeConfig } from "@/hooks/useFirestore";
import MaintenancePage         from "@/components/MaintenancePage";

// ── Theme Manager ─────────────────────────────────────────
function ThemeManager() {
  const theme  = useThemeConfig();
  const [mode, setMode] = useState<"light"|"dark">("light");

  // Read saved mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("zeyy-theme") as "light"|"dark" | null;
    if (saved) setMode(saved);
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setMode(prefersDark ? "dark" : "light");
    }
  }, []);

  // Apply mode class + CSS vars
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("zeyy-theme", mode);
  }, [mode]);

  // Apply Firebase theme colors
  useEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    if (mode === "light") {
      root.style.setProperty("--color-bg",     theme.light_bg);
      root.style.setProperty("--color-text",   theme.light_text);
      root.style.setProperty("--color-accent", theme.accent);
    } else {
      root.style.setProperty("--color-bg",     theme.dark_bg);
      root.style.setProperty("--color-text",   theme.dark_text);
      root.style.setProperty("--color-accent", theme.accent);
    }
  }, [theme, mode]);

  // Expose toggle globally
  useEffect(() => {
    (window as any).zeyyToggleTheme = () => {
      setMode((prev) => prev === "dark" ? "light" : "dark");
    };
    (window as any).zeyyGetTheme = () => mode;
  }, [mode]);

  return null;
}

// ── Maintenance Gate ──────────────────────────────────────
function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const m    = useMaintenance();
  const lang = useStore((s) => s.lang);
  if (m?.is_active) {
    return <MaintenancePage messageAr={m.message_ar} messageEn={m.message_en} estimatedTime={m.estimated_time} lang={lang} />;
  }
  return <>{children}</>;
}

// ── Dir Sync ──────────────────────────────────────────────
function DirSync() {
  const lang = useStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return null;
}

// ── Main ──────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {mounted && <ThemeManager />}
      {mounted && <DirSync />}
      <MaintenanceGate>{children}</MaintenanceGate>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background:   "var(--color-text)",
            color:        "var(--color-bg)",
            fontFamily:   "Cormorant Garamond, serif",
            fontSize:     "14px",
            borderRadius: "0",
            padding:      "12px 20px",
          },
        }}
      />
    </>
  );
}
