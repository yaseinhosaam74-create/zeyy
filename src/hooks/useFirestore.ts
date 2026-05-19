// src/hooks/useFirestore.ts
// ─────────────────────────────────────────────────────────
// ZEYY | Custom Hooks — Firebase real-time listeners
// ─────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  ThemeConfig,
  MaintenanceConfig,
  SectionConfig,
  ContentBlock,
} from "@/lib/firestore-schema";

// ── useTheme ──────────────────────────────────────────────
export function useThemeConfig() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "theme"), (snap) => {
      if (snap.exists()) setTheme(snap.data() as ThemeConfig);
    });
    return () => unsub();
  }, []);
  return theme;
}

// ── useMaintenance ────────────────────────────────────────
export function useMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceConfig | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "maintenance"), (snap) => {
      if (snap.exists()) setMaintenance(snap.data() as MaintenanceConfig);
    });
    return () => unsub();
  }, []);
  return maintenance;
}

// ── useSocial ─────────────────────────────────────────────
export function useSocial() {
  const [social, setSocial] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "social"), (snap) => {
      if (snap.exists()) setSocial(snap.data());
    });
    return () => unsub();
  }, []);
  return social;
}

// ── useSections ───────────────────────────────────────────
export function useSections() {
  const [sections, setSections] = useState<Record<string, SectionConfig>>({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sections"), (snap) => {
      const data: Record<string, SectionConfig> = {};
      snap.forEach((d) => { data[d.id] = d.data() as SectionConfig; });
      setSections(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);
  // Only visible sections, sorted by order
  const visible = Object.entries(sections)
    .filter(([, v]) => v.visible)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id, v]) => ({ id, ...v }));
  return { sections, visible, loading };
}

// ── useContent ────────────────────────────────────────────
export function useContent(page: string) {
  const [content, setContent] = useState<ContentBlock>({});
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "content", page), (snap) => {
      if (snap.exists()) setContent(snap.data() as ContentBlock);
    });
    return () => unsub();
  }, [page]);
  return content;
}

// ── useProducts ───────────────────────────────────────────
export function useProducts(category?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      let data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (category) data = data.filter((p: any) => p.category === category);
      setProducts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [category]);
  return { products, loading };
}

// ── useProduct (single) ───────────────────────────────────
export function useProduct(id: string) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "products", id), (snap) => {
      if (snap.exists()) setProduct({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
    return () => unsub();
  }, [id]);
  return { product, loading };
}
