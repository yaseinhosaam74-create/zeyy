"use client";
// src/app/zeyy.manger.7474/products/page.tsx
// ─────────────────────────────────────────────────────────
// ZEYY MANAGER — Products Panel
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, onSnapshot, serverTimestamp, query, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Edit2, Trash2, Eye, EyeOff, Upload, Save, ChevronDown } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────
interface Product {
  id?:             string;
  name_ar:         string;
  name_en:         string;
  description_ar:  string;
  description_en:  string;
  details_ar:      string;
  details_en:      string;
  price:           number;
  category:        string;
  gender:          string;
  sizes:           string[];
  images:          string[];
  featured:        boolean;
  sold_out:        boolean;
  badge_ar:        string;
  badge_en:        string;
  created_at?:     any;
}

const EMPTY: Product = {
  name_ar: "", name_en: "", description_ar: "", description_en: "",
  details_ar: "", details_en: "", price: 0, category: "hoodies",
  gender: "unisex", sizes: [], images: [], featured: false,
  sold_out: false, badge_ar: "", badge_en: "",
};

const CATEGORIES = ["hoodies","tshirts","sweatpants","basics","limited"];
const GENDERS    = ["men","women","unisex"];
const ALL_SIZES  = ["XS","S","M","L","XL","XXL"];

// Admin-only CSS vars
const S = {
  bg:      "#0f1117",
  surface: "#161b27",
  border:  "rgba(255,255,255,0.07)",
  text:    "#e8dcca",
  red:     "#38040E",
};

// ── Image Upload via Cloudinary ────────────────────────────
async function uploadImage(file: File): Promise<string> {
  const cloudName  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "zeyy_upload";

  if (!cloudName) throw new Error("Cloudinary not configured");

  const formData = new FormData();
  formData.append("file",         file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder",        "products");

  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body:   formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

// ── Product Form Modal ─────────────────────────────────────
function ProductForm({
  initial,
  onSave,
  onClose,
}: {
  initial?: Product;
  onSave:   (p: Product) => Promise<void>;
  onClose:  () => void;
}) {
  const [form,     setForm]     = useState<Product>(initial || { ...EMPTY });
  const [saving,   setSaving]   = useState(false);
  const [uploading,setUploading]= useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof Product, val: any) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function toggleSize(size: string) {
    set("sizes", form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size]);
  }

  async function handleImages(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage));
      set("images", [...form.images, ...urls]);
      toast.success("✓ Images uploaded");
    } catch {
      toast.error("Upload failed — check Cloudinary settings");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name_ar || !form.name_en) {
      toast.error("Name (AR + EN) required");
      return;
    }
    setSaving(true);
    try {
      await onSave(form);
      toast.success("✓ Product saved");
      onClose();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 14px", fontSize: "13px",
    background: S.surface, border: `1px solid ${S.border}`,
    color: S.text, outline: "none",
  };
  const labelStyle = { display: "block", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, opacity: 0.4, marginBottom: "6px", color: S.text };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ position: "relative", width: "100%", maxWidth: "520px", height: "100vh", background: S.bg, overflowY: "auto", borderLeft: `1px solid ${S.border}` }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: S.bg, zIndex: 1 }}>
          <h2 style={{ fontSize: "14px", fontWeight: 600, color: S.text, letterSpacing: "0.05em" }}>
            {initial?.id ? "Edit Product" : "Add Product"}
          </h2>
          <button onClick={onClose} style={{ color: S.text, opacity: 0.4, background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px" }}>

          {/* Images */}
          <div style={{ marginBottom: "24px" }}>
            <label style={labelStyle}>Images</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position: "relative", width: "72px", height: "88px" }}>
                  <Image src={url} alt="" fill style={{ objectFit: "cover" }} />
                  <button
                    onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    style={{ position: "absolute", top: 2, right: 2, background: "#38040E", border: "none", borderRadius: "50%", width: "18px", height: "18px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={10} color="#E8DCCA" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileRef.current?.click()}
                style={{ width: "72px", height: "88px", border: `1px dashed ${S.border}`, background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: S.text, opacity: uploading ? 0.4 : 0.6 }}>
                {uploading ? <span style={{ fontSize: "10px" }}>...</span> : <><Upload size={16} /><span style={{ fontSize: "9px", letterSpacing: "0.1em" }}>UPLOAD</span></>}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleImages(e.target.files)} />
            <p style={{ fontSize: "10px", opacity: 0.3, color: S.text }}>First image = main. Drag to reorder.</p>
          </div>

          {/* Names */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Name (عربي) *</label>
              <input type="text" value={form.name_ar} onChange={(e) => set("name_ar", e.target.value)} style={{ ...inputStyle, direction: "rtl", fontFamily: "Aref Ruqaa, serif" }} />
            </div>
            <div>
              <label style={labelStyle}>Name (EN) *</label>
              <input type="text" value={form.name_en} onChange={(e) => set("name_en", e.target.value)} style={inputStyle} />
            </div>
          </div>

          {/* Price, Category, Gender */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Price (SAR) *</label>
              <input type="number" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Sizes</label>
            <div style={{ display: "flex", gap: "6px" }}>
              {ALL_SIZES.map((size) => (
                <button key={size} onClick={() => toggleSize(size)}
                  style={{
                    width: "40px", height: "40px", fontSize: "12px", cursor: "pointer",
                    background: form.sizes.includes(size) ? "#38040E" : "transparent",
                    color: form.sizes.includes(size) ? "#E8DCCA" : S.text,
                    border: `1px solid ${form.sizes.includes(size) ? "#38040E" : S.border}`,
                    transition: "all 0.2s",
                  }}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          {[
            { key: "description_ar", label: "Short Desc (عربي)", dir: "rtl" },
            { key: "description_en", label: "Short Desc (EN)",   dir: "ltr" },
            { key: "details_ar",     label: "Details (عربي)",    dir: "rtl" },
            { key: "details_en",     label: "Details (EN)",      dir: "ltr" },
          ].map(({ key, label, dir }) => (
            <div key={key} style={{ marginBottom: "12px" }}>
              <label style={labelStyle}>{label}</label>
              <textarea
                value={(form as any)[key] || ""}
                onChange={(e) => set(key as keyof Product, e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: "none", direction: dir as any, fontFamily: dir === "rtl" ? "Aref Ruqaa, serif" : "inherit" }}
              />
            </div>
          ))}

          {/* Badges */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={labelStyle}>Badge (عربي)</label>
              <input type="text" value={form.badge_ar || ""} onChange={(e) => set("badge_ar", e.target.value)} style={{ ...inputStyle, direction: "rtl" }} placeholder="e.g. جديد" />
            </div>
            <div>
              <label style={labelStyle}>Badge (EN)</label>
              <input type="text" value={form.badge_en || ""} onChange={(e) => set("badge_en", e.target.value)} style={inputStyle} placeholder="e.g. New" />
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "28px" }}>
            {[
              { key: "featured", label: "Featured" },
              { key: "sold_out", label: "Sold Out" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => set(key as keyof Product, !(form as any)[key])}
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", fontSize: "11px", letterSpacing: "0.1em",
                  textTransform: "uppercase", cursor: "pointer",
                  background: (form as any)[key] ? "#38040E" : "transparent",
                  color:      (form as any)[key] ? "#E8DCCA" : S.text,
                  border: `1px solid ${(form as any)[key] ? "#38040E" : S.border}`,
                  transition: "all 0.2s",
                }}>
                {(form as any)[key] ? <Eye size={12} /> : <EyeOff size={12} />}
                {label}
              </button>
            ))}
          </div>

          {/* Save */}
          <button onClick={handleSave} disabled={saving}
            style={{
              width: "100%", padding: "14px", display: "flex", alignItems: "center",
              justifyContent: "center", gap: "8px", fontSize: "12px", letterSpacing: "0.15em",
              textTransform: "uppercase", cursor: "pointer", background: "#38040E",
              color: "#E8DCCA", border: "none", opacity: saving ? 0.6 : 1,
            }}>
            <Save size={14} />
            {saving ? "Saving..." : "Save Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Products Page ─────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing,  setEditing]  = useState<Product | null>(null);
  const [adding,   setAdding]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("all");

  useEffect(() => {
    const q    = query(collection(db, "products"), orderBy("created_at", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product)));
    });
    return () => unsub();
  }, []);

  async function saveProduct(form: Product) {
    if (form.id) {
      const { id, ...data } = form;
      await updateDoc(doc(db, "products", id!), data);
    } else {
      await addDoc(collection(db, "products"), { ...form, created_at: serverTimestamp() });
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteDoc(doc(db, "products", id));
    toast.success("Deleted");
  }

  async function toggleSoldOut(p: Product) {
    await updateDoc(doc(db, "products", p.id!), { sold_out: !p.sold_out });
  }

  async function toggleFeatured(p: Product) {
    await updateDoc(doc(db, "products", p.id!), { featured: !p.featured });
  }

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name_ar.includes(search) || p.name_en.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ minHeight: "100%", fontFamily: "Cormorant Garamond, serif" }}>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["all", ...CATEGORIES].map((cat) => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{
                padding: "6px 14px", fontSize: "11px", letterSpacing: "0.1em",
                textTransform: "uppercase", cursor: "pointer",
                background: filter === cat ? "#38040E" : "transparent",
                color: S.text, border: `1px solid ${filter === cat ? "#38040E" : S.border}`,
              }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "7px 14px", fontSize: "12px", background: S.surface, border: `1px solid ${S.border}`, color: S.text, outline: "none", width: "160px" }} />
          <button onClick={() => setAdding(true)}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase", background: "#38040E", color: "#E8DCCA", border: "none", cursor: "pointer" }}>
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total",    value: products.length     },
          { label: "Featured", value: products.filter((p) => p.featured).length  },
          { label: "Sold Out", value: products.filter((p) => p.sold_out).length  },
          { label: "Showing",  value: filtered.length     },
        ].map((s) => (
          <div key={s.label} style={{ padding: "16px", background: S.surface, border: `1px solid ${S.border}` }}>
            <p style={{ fontSize: "10px", opacity: 0.4, letterSpacing: "0.12em", textTransform: "uppercase", color: S.text, marginBottom: "6px" }}>{s.label}</p>
            <p style={{ fontSize: "2rem", fontWeight: 600, color: S.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Products Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", opacity: 0.3, color: S.text }}>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {filtered.map((p) => (
            <div key={p.id}
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: S.surface, border: `1px solid ${S.border}` }}>

              {/* Image */}
              <div style={{ width: "44px", height: "56px", flexShrink: 0, position: "relative", background: "#1a1a2e", overflow: "hidden" }}>
                {p.images?.[0] ? (
                  <Image src={p.images[0]} alt="" fill style={{ objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: "8px", opacity: 0.3, color: S.text }}>IMG</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "13px", fontWeight: 500, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name_en}
                </p>
                <p style={{ fontSize: "11px", opacity: 0.35, color: S.text, marginTop: "2px" }}>
                  {p.category} · {p.gender} · {p.price} SAR
                </p>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: "4px" }}>
                {p.featured  && <span style={{ fontSize: "9px", padding: "3px 8px", background: "#305252", color: "#E8DCCA", letterSpacing: "0.1em" }}>FEATURED</span>}
                {p.sold_out  && <span style={{ fontSize: "9px", padding: "3px 8px", background: "#38040E", color: "#E8DCCA", letterSpacing: "0.1em" }}>SOLD OUT</span>}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "4px" }}>
                <button onClick={() => toggleFeatured(p)} title={p.featured ? "Unfeature" : "Feature"}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${S.border}`, cursor: "pointer", color: S.text, opacity: p.featured ? 1 : 0.4 }}>
                  <Eye size={13} />
                </button>
                <button onClick={() => toggleSoldOut(p)} title={p.sold_out ? "In Stock" : "Mark Sold Out"}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${S.border}`, cursor: "pointer", color: S.text, opacity: p.sold_out ? 1 : 0.4 }}>
                  <EyeOff size={13} />
                </button>
                <button onClick={() => setEditing(p)}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${S.border}`, cursor: "pointer", color: S.text }}>
                  <Edit2 size={13} />
                </button>
                <button onClick={() => deleteProduct(p.id!)}
                  style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: `1px solid ${S.border}`, cursor: "pointer", color: "#e74c3c" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {adding && (
          <ProductForm onSave={saveProduct} onClose={() => setAdding(false)} />
        )}
        {editing && (
          <ProductForm initial={editing} onSave={saveProduct} onClose={() => setEditing(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
