"use client";
// src/app/zeyy.manger.7474/page.tsx

import { useState, useEffect, useRef } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, onSnapshot, collection, addDoc, deleteDoc, serverTimestamp, query, orderBy, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  LayoutDashboard, Package, Layers, FileText, Palette, Share2,
  Wrench, Settings, LogOut, Eye, EyeOff, Power, Save,
  ChevronRight, Plus, Edit2, Trash2, Upload, X,
  ShoppingCart, MessageSquare, Search, Tag, RefreshCw,
  Reply, Mail, Phone, Store, MessageCircle,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────
const S = {
  bg:      "#0f1117",
  surface: "#161b27",
  surface2:"#1c2235",
  border:  "rgba(255,255,255,0.07)",
  text:    "#e8dcca",
  red:     "#38040E",
  teal:    "#305252",
  input:   {
    background: "#161b27",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e8dcca",
    padding: "10px 14px",
    fontSize: "13px",
    outline: "none",
    width: "100%",
  } as React.CSSProperties,
};

const BRAND_COLORS = [
  { hex: "#38040E", name: "Hero Red"    },
  { hex: "#E8DCCA", name: "Abiya White" },
  { hex: "#305252", name: "Deep Teal"   },
  { hex: "#1A2238", name: "Midnight"    },
  { hex: "#000000", name: "Black"       },
];

const ALL_SIZES = ["XS","S","M","L","XL","XXL","Free Size"];
const GENDERS   = ["men","women","unisex"];

type Tab = "dashboard"|"products"|"stock"|"offers"|"orders"|"sections"|"content"|"theme"|"social"|"maintenance"|"messages"|"settings";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard",   label: "Dashboard",       icon: LayoutDashboard },
  { id: "products",    label: "Products",        icon: Package         },
  { id: "stock",       label: "Stock / Restock", icon: RefreshCw       },
  { id: "offers",      label: "Offers",          icon: Tag             },
  { id: "orders",      label: "Orders",          icon: ShoppingCart    },
  { id: "sections",    label: "Sections",        icon: Layers          },
  { id: "content",     label: "Content",         icon: FileText        },
  { id: "theme",       label: "Theme",           icon: Palette         },
  { id: "social",      label: "Social Media",    icon: Share2          },
  { id: "maintenance", label: "Maintenance",     icon: Wrench          },
  { id: "messages",    label: "Messages",        icon: MessageSquare   },
  { id: "settings",    label: "Settings",        icon: Settings        },
];

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
function LoginScreen() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);

  async function login() {
    if (!email || !password) return;
    setLoading(true);
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch { toast.error("Invalid credentials"); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:S.red, padding:"2rem" }}>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:"360px" }}>
        <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
          <h1 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:"3rem", fontWeight:600, color:S.text }}>zeyy</h1>
          <p style={{ fontSize:"11px", letterSpacing:"0.2em", textTransform:"uppercase", color:S.text, opacity:0.4, marginTop:"4px" }}>Manager Dashboard</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
            style={{ ...S.input, background:"rgba(232,220,202,0.08)", border:"1px solid rgba(232,220,202,0.2)" }}
            onKeyDown={e=>e.key==="Enter"&&login()} />
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
            style={{ ...S.input, background:"rgba(232,220,202,0.08)", border:"1px solid rgba(232,220,202,0.2)" }}
            onKeyDown={e=>e.key==="Enter"&&login()} />
          <button onClick={login} disabled={loading}
            style={{ padding:"14px", background:S.text, color:S.red, fontSize:"12px", letterSpacing:"0.15em", textTransform:"uppercase", border:"none", cursor:"pointer", opacity:loading?0.6:1, marginTop:"8px" }}>
            {loading ? "..." : "Enter"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CLOUDINARY UPLOAD
// ══════════════════════════════════════════════════════════
async function uploadImage(file: File): Promise<string> {
  const cloud  = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "zeyy_upload";
  if (!cloud) throw new Error("Cloudinary not configured in .env.local");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", preset);
  fd.append("folder", "products");
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method:"POST", body:fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

// ══════════════════════════════════════════════════════════
// PRODUCT FORM
// ══════════════════════════════════════════════════════════
interface StockEntry { size: string; qty: number; }
interface Product {
  id?: string; name_ar: string; name_en: string;
  description_ar: string; description_en: string;
  details_ar: string; details_en: string;
  price: number; category: string; gender: string;
  stock: StockEntry[]; images: string[];
  featured: boolean; sold_out: boolean;
  badge_ar: string; badge_en: string;
}
const EMPTY_P: Product = {
  name_ar:"", name_en:"", description_ar:"", description_en:"",
  details_ar:"", details_en:"", price:0, category:"hoodies",
  gender:"unisex", stock:[], images:[], featured:false, sold_out:false,
  badge_ar:"", badge_en:"",
};

function ProductForm({ initial, categories, onSave, onClose }: {
  initial?: Product; categories: string[];
  onSave: (p: Product) => Promise<void>; onClose: () => void;
}) {
  const [form,      setForm]      = useState<Product>(initial ? { ...initial, stock: initial.stock || [] } : { ...EMPTY_P });
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  function setStock(size: string, qty: number) {
    const existing = form.stock.filter(s => s.size !== size);
    if (qty > 0) set("stock", [...existing, { size, qty }]);
    else set("stock", existing);
  }
  function getQty(size: string) { return form.stock.find(s => s.size === size)?.qty || 0; }
  const totalStock = form.stock.reduce((s, e) => s + e.qty, 0);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    try {
      const urls = await Promise.all(Array.from(files).map(uploadImage));
      set("images", [...form.images, ...urls]);
      toast.success(`✓ ${urls.length} image(s) uploaded`);
    } catch (e: any) { toast.error(e.message); }
    finally { setUploading(false); }
  }

  async function save() {
    if (!form.name_ar || !form.name_en || !form.price) { toast.error("Name (AR+EN) and Price required"); return; }
    setSaving(true);
    const sizes = form.stock.filter(s => s.qty > 0).map(s => s.size);
    const productToSave = { ...form, sizes, sold_out: totalStock === 0 && form.stock.length > 0 };
    try { await onSave(productToSave); toast.success("✓ Saved"); onClose(); }
    catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  }

  const label = (txt: string) => (
    <label style={{ display:"block", fontSize:"10px", letterSpacing:"0.12em", textTransform:"uppercase" as const, color:S.text, opacity:0.4, marginBottom:"6px" }}>{txt}</label>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:60, display:"flex", justifyContent:"flex-end" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)" }} onClick={onClose} />
      <motion.div initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }} transition={{ duration:0.4, ease:[0.25,0.46,0.45,0.94] }}
        style={{ position:"relative", width:"100%", maxWidth:"540px", height:"100vh", overflowY:"auto", background:S.bg, borderLeft:`1px solid ${S.border}` }}>
        <div style={{ position:"sticky", top:0, zIndex:1, background:S.bg, padding:"20px 24px", borderBottom:`1px solid ${S.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:"14px", fontWeight:600, color:S.text }}>{initial?.id ? "✏️ Edit Product" : "➕ New Product"}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:S.text, opacity:0.5 }}><X size={18}/></button>
        </div>

        <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:"20px" }}>
          {/* Images */}
          <div>
            {label("Product Images")}
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"8px" }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position:"relative", width:"68px", height:"84px" }}>
                  <Image src={url} alt="" fill style={{ objectFit:"cover" }} />
                  <button onClick={() => set("images", form.images.filter((_, j) => j !== i))}
                    style={{ position:"absolute", top:2, right:2, width:"16px", height:"16px", borderRadius:"50%", background:S.red, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <X size={9} color="#E8DCCA"/>
                  </button>
                  {i === 0 && <span style={{ position:"absolute", bottom:2, left:2, fontSize:"7px", background:"rgba(0,0,0,0.7)", color:"#E8DCCA", padding:"1px 3px" }}>MAIN</span>}
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                style={{ width:"68px", height:"84px", border:`1px dashed ${S.border}`, background:"transparent", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"4px", color:S.text, opacity:uploading?0.4:0.6 }}>
                {uploading ? <span style={{ fontSize:"9px" }}>...</span> : <><Upload size={14}/><span style={{ fontSize:"8px" }}>ADD</span></>}
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleFiles(e.target.files)} />
          </div>

          {/* Names */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>{label("الاسم *")}<input value={form.name_ar} onChange={e=>set("name_ar",e.target.value)} style={{ ...S.input, direction:"rtl", fontFamily:"Aref Ruqaa, serif" }}/></div>
            <div>{label("Name *")}<input value={form.name_en} onChange={e=>set("name_en",e.target.value)} style={S.input}/></div>
          </div>

          {/* Price + Category + Gender */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
            <div>{label("Price (EGP) *")}<input type="number" value={form.price||""} onChange={e=>set("price",Number(e.target.value))} style={S.input}/></div>
            <div>
              {label("Category")}
              <select value={form.category} onChange={e=>set("category",e.target.value)} style={{ ...S.input, cursor:"pointer" }}>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              {label("Gender")}
              <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={{ ...S.input, cursor:"pointer" }}>
                {GENDERS.map(g=><option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          {/* Stock per size */}
          <div>
            {label(`Stock per Size — Total: ${totalStock}`)}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:"8px" }}>
              {ALL_SIZES.map(size => (
                <div key={size} style={{ background:S.surface, border:`1px solid ${getQty(size)>0?S.teal:S.border}`, padding:"8px" }}>
                  <p style={{ fontSize:"10px", textAlign:"center", color:S.text, opacity:0.6, marginBottom:"4px", letterSpacing:"0.1em" }}>{size}</p>
                  <input type="number" min="0" value={getQty(size)||""} placeholder="0"
                    onChange={e=>setStock(size,Number(e.target.value))}
                    style={{ width:"100%", background:"transparent", border:"none", borderBottom:`1px solid ${S.border}`, color:getQty(size)>0?"#2ecc71":S.text, fontSize:"14px", fontWeight:600, textAlign:"center", outline:"none", padding:"2px 0" }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>{label("الوصف")}<textarea value={form.description_ar||""} onChange={e=>set("description_ar",e.target.value)} rows={3} style={{ ...S.input, resize:"none", direction:"rtl", fontFamily:"Aref Ruqaa, serif" }}/></div>
            <div>{label("Description")}<textarea value={form.description_en||""} onChange={e=>set("description_en",e.target.value)} rows={3} style={{ ...S.input, resize:"none" }}/></div>
          </div>

          {/* Badges */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div>{label("شارة")}<input value={form.badge_ar||""} onChange={e=>set("badge_ar",e.target.value)} placeholder="جديد" style={{ ...S.input, direction:"rtl" }}/></div>
            <div>{label("Badge")}<input value={form.badge_en||""} onChange={e=>set("badge_en",e.target.value)} placeholder="New" style={S.input}/></div>
          </div>

          {/* Featured toggle */}
          <button onClick={()=>set("featured",!form.featured)}
            style={{ padding:"10px", fontSize:"12px", cursor:"pointer", transition:"all 0.2s", background:form.featured?S.red:"transparent", color:form.featured?"#E8DCCA":S.text, border:`1px solid ${form.featured?S.red:S.border}` }}>
            {form.featured ? "⭐ Featured" : "☆ Not Featured"}
          </button>

          <button onClick={save} disabled={saving||uploading}
            style={{ width:"100%", padding:"15px", background:S.red, color:"#E8DCCA", fontSize:"12px", letterSpacing:"0.15em", textTransform:"uppercase", border:"none", cursor:"pointer", opacity:(saving||uploading)?0.6:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"8px" }}>
            <Save size={14}/>
            {saving?"Saving...":uploading?"Uploading...":initial?.id?"Update Product":"Add Product"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════════
function DashboardPanel() {
  const [stats, setStats] = useState({ products:0, orders:0, pending:0, messages:0, offers:0 });
  useEffect(() => {
    const u1 = onSnapshot(collection(db,"products"), s=>setStats(p=>({...p,products:s.size})));
    const u2 = onSnapshot(collection(db,"orders"),   s=>{ const pending=s.docs.filter(d=>d.data().status==="pending").length; setStats(p=>({...p,orders:s.size,pending})); });
    const u3 = onSnapshot(collection(db,"messages"), s=>setStats(p=>({...p,messages:s.docs.filter(d=>!d.data().read).length})));
    const u4 = onSnapshot(collection(db,"offers"),   s=>setStats(p=>({...p,offers:s.docs.filter(d=>d.data().active).length})));
    return ()=>{ u1(); u2(); u3(); u4(); };
  }, []);

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px" }}>
      {[
        { l:"Products",      v:stats.products, c:S.teal    },
        { l:"Total Orders",  v:stats.orders,   c:"#3498db" },
        { l:"Pending",       v:stats.pending,  c:"#e67e22" },
        { l:"Unread Msgs",   v:stats.messages, c:S.red     },
        { l:"Active Offers", v:stats.offers,   c:"#9b59b6" },
      ].map(s => (
        <div key={s.l} style={{ padding:"20px", background:S.surface, border:`1px solid ${S.border}` }}>
          <p style={{ fontSize:"10px", opacity:0.35, textTransform:"uppercase", letterSpacing:"0.12em", color:S.text, marginBottom:"8px" }}>{s.l}</p>
          <p style={{ fontSize:"2.5rem", fontWeight:600, color:s.c, fontFamily:"Cormorant Garamond, serif" }}>{s.v}</p>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// PRODUCTS PANEL
// ══════════════════════════════════════════════════════════
function ProductsPanel() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [editing,    setEditing]    = useState<Product|null>(null);
  const [adding,     setAdding]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("all");

  useEffect(() => {
    const q  = query(collection(db,"products"), orderBy("created_at","desc"));
    const u1 = onSnapshot(q, snap=>setProducts(snap.docs.map(d=>({id:d.id,...d.data()} as Product))));
    const u2 = onSnapshot(collection(db,"sections"), snap=>{
      const cats: string[] = [];
      snap.forEach(d=>{ const s=d.data(); if(s.visible) cats.push(s.slug); });
      setCategories(cats);
    });
    return ()=>{ u1(); u2(); };
  }, []);

  async function saveProduct(form: Product) {
    if (form.id) { const {id,...data}=form; await updateDoc(doc(db,"products",id!),data); }
    else          { await addDoc(collection(db,"products"),{...form,created_at:serverTimestamp()}); }
  }
  async function del(id: string) { if(!confirm("Delete?"))return; await deleteDoc(doc(db,"products",id)); toast.success("Deleted"); }
  async function toggleFeatured(p: Product) { await updateDoc(doc(db,"products",p.id!),{featured:!p.featured}); }

  const filtered = products
    .filter(p=>(filter==="all"||p.category===filter))
    .filter(p=>(!search||p.name_ar.includes(search)||p.name_en.toLowerCase().includes(search.toLowerCase())));

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"20px", flexWrap:"wrap", gap:"10px" }}>
        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
          {["all",...categories].map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{ padding:"5px 12px", fontSize:"10px", letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer", background:filter===c?S.red:"transparent", color:S.text, border:`1px solid ${filter===c?S.red:S.border}` }}>{c}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <div style={{ position:"relative" }}>
            <Search size={12} style={{ position:"absolute", top:"50%", transform:"translateY(-50%)", left:"10px", color:S.text, opacity:0.3 }}/>
            <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{ ...S.input, paddingLeft:"30px", width:"160px" }}/>
          </div>
          <button onClick={()=>setAdding(true)} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 16px", fontSize:"11px", letterSpacing:"0.1em", textTransform:"uppercase", background:S.red, color:"#E8DCCA", border:"none", cursor:"pointer" }}>
            <Plus size={14}/> Add
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px", marginBottom:"20px" }}>
        {[{l:"Total",v:products.length},{l:"Featured",v:products.filter(p=>p.featured).length},{l:"Sold Out",v:products.filter(p=>p.sold_out).length},{l:"Showing",v:filtered.length}].map(s=>(
          <div key={s.l} style={{ padding:"12px 14px", background:S.surface, border:`1px solid ${S.border}` }}>
            <p style={{ fontSize:"9px", opacity:0.35, letterSpacing:"0.12em", textTransform:"uppercase", color:S.text, marginBottom:"4px" }}>{s.l}</p>
            <p style={{ fontSize:"1.6rem", fontWeight:600, color:S.text, fontFamily:"Cormorant Garamond, serif" }}>{s.v}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
        {filtered.map(p=>{
          const totalStock=(p.stock||[]).reduce((s,e)=>s+e.qty,0);
          return (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"10px 14px", background:S.surface, border:`1px solid ${S.border}` }}>
              <div style={{ width:"40px", height:"50px", flexShrink:0, position:"relative", overflow:"hidden", background:"#1a1a2e" }}>
                {p.images?.[0]?<Image src={p.images[0]} alt="" fill style={{ objectFit:"cover" }}/>:<div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:"7px",opacity:0.2,color:S.text }}>IMG</span></div>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:"13px", fontWeight:500, color:S.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name_en}</p>
                <p style={{ fontSize:"10px", color:S.text, opacity:0.3, marginTop:"2px" }}>
                  {p.category} · {p.price} EGP · Stock: <span style={{ color:totalStock>0?"#2ecc71":"#e74c3c" }}>{totalStock}</span>
                </p>
              </div>
              <div style={{ display:"flex", gap:"3px" }}>
                {p.featured&&<span style={{ fontSize:"8px",padding:"2px 6px",background:S.teal,color:"#E8DCCA" }}>FEATURED</span>}
                {p.sold_out&&<span style={{ fontSize:"8px",padding:"2px 6px",background:S.red,color:"#E8DCCA" }}>SOLD OUT</span>}
                {totalStock>0&&totalStock<=5&&<span style={{ fontSize:"8px",padding:"2px 6px",background:"#e67e22",color:"#E8DCCA" }}>LOW</span>}
              </div>
              <div style={{ display:"flex", gap:"3px" }}>
                <button onClick={()=>toggleFeatured(p)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:S.text,opacity:p.featured?1:0.4 }}><Eye size={11}/></button>
                <button onClick={()=>setEditing(p)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:S.text }}><Edit2 size={11}/></button>
                <button onClick={()=>del(p.id!)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:"#e74c3c" }}><Trash2 size={11}/></button>
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{ textAlign:"center",padding:"4rem",opacity:0.2,color:S.text }}>No products yet</div>}
      </div>

      <AnimatePresence>
        {adding  && <ProductForm categories={categories} onSave={saveProduct} onClose={()=>setAdding(false)}/>}
        {editing && <ProductForm initial={editing} categories={categories} onSave={saveProduct} onClose={()=>setEditing(null)}/>}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// STOCK PANEL
// ══════════════════════════════════════════════════════════
function StockPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter,   setFilter]   = useState<"all"|"low"|"out">("all");

  useEffect(()=>{
    const q=query(collection(db,"products"),orderBy("created_at","desc"));
    return onSnapshot(q,snap=>setProducts(snap.docs.map(d=>({id:d.id,...d.data()} as Product))));
  },[]);

  async function updateStock(productId: string, size: string, qty: number, currentStock: StockEntry[]) {
    const updated = currentStock.filter(s=>s.size!==size);
    if (qty>0) updated.push({size,qty});
    const sizes    = updated.filter(s=>s.qty>0).map(s=>s.size);
    const total    = updated.reduce((s,e)=>s+e.qty,0);
    await updateDoc(doc(db,"products",productId),{stock:updated,sizes,sold_out:total===0&&updated.length>0});
    toast.success(`✓ ${size} updated`);
  }

  const filtered = products.filter(p=>{
    const total=(p.stock||[]).reduce((s,e)=>s+e.qty,0);
    if (filter==="out") return total===0;
    if (filter==="low") return total>0&&total<=5;
    return true;
  });

  return (
    <div>
      <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
        {([["all","All Products"],["low","⚠️ Low (≤5)"],["out","❌ Out of Stock"]] as [typeof filter,string][]).map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{ padding:"6px 14px",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",background:filter===v?S.red:"transparent",color:S.text,border:`1px solid ${filter===v?S.red:S.border}` }}>{l}</button>
        ))}
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {filtered.map(p=>{
          const stock=p.stock||[];
          const total=stock.reduce((s,e)=>s+e.qty,0);
          return (
            <div key={p.id} style={{ background:S.surface,border:`1px solid ${S.border}`,padding:"16px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px" }}>
                <div style={{ width:"40px",height:"50px",position:"relative",overflow:"hidden",background:"#1a1a2e",flexShrink:0 }}>
                  {p.images?.[0]&&<Image src={p.images[0]} alt="" fill style={{ objectFit:"cover" }}/>}
                </div>
                <div>
                  <p style={{ fontSize:"13px",fontWeight:500,color:S.text }}>{p.name_en}</p>
                  <p style={{ fontSize:"11px",color:total===0?"#e74c3c":total<=5?"#e67e22":"#2ecc71",marginTop:"2px" }}>Total: {total} units</p>
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:"8px" }}>
                {ALL_SIZES.map(size=>{
                  const qty=stock.find(s=>s.size===size)?.qty||0;
                  return (
                    <div key={size} style={{ background:S.surface2,border:`1px solid ${qty>0?S.teal:S.border}`,padding:"8px",textAlign:"center" }}>
                      <p style={{ fontSize:"9px",color:S.text,opacity:0.5,letterSpacing:"0.1em",marginBottom:"4px" }}>{size}</p>
                      <input type="number" min="0" defaultValue={qty}
                        onBlur={e=>{ const n=Number(e.target.value); if(n!==qty) updateStock(p.id!,size,n,stock); }}
                        style={{ width:"100%",background:"transparent",border:"none",borderBottom:`1px solid ${qty>0?S.teal:S.border}`,color:qty>0?"#2ecc71":S.text,fontSize:"16px",fontWeight:700,textAlign:"center",outline:"none",padding:"2px 0" }}/>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {filtered.length===0&&<div style={{ textAlign:"center",padding:"3rem",opacity:0.2,color:S.text }}>No products</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// OFFERS PANEL
// ══════════════════════════════════════════════════════════
function OffersPanel() {
  const [offers,   setOffers]   = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [form,     setForm]     = useState({ product_id:"", discount_price:0, label_ar:"عرض محدود", label_en:"Limited Offer", expires_at:"", active:true });
  const [adding,   setAdding]   = useState(false);

  useEffect(()=>{
    const u1=onSnapshot(collection(db,"offers"),snap=>setOffers(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(collection(db,"products"),snap=>setProducts(snap.docs.map(d=>({id:d.id,...d.data()}))));
    return ()=>{ u1(); u2(); };
  },[]);

  async function saveOffer() {
    if (!form.product_id||!form.discount_price){ toast.error("Product and price required"); return; }
    const product=products.find(p=>p.id===form.product_id);
    await addDoc(collection(db,"offers"),{...form,product_name:product?.name_en||"",created_at:serverTimestamp()});
    await updateDoc(doc(db,"products",form.product_id),{ offer_price:form.discount_price,offer_label_ar:form.label_ar,offer_label_en:form.label_en,offer_expires:form.expires_at,has_offer:true });
    toast.success("✓ Offer created");
    setAdding(false);
  }

  async function deleteOffer(offer: any) {
    await deleteDoc(doc(db,"offers",offer.id));
    await updateDoc(doc(db,"products",offer.product_id),{has_offer:false,offer_price:null});
    toast.success("Removed");
  }

  async function toggleOffer(offer: any) {
    await updateDoc(doc(db,"offers",offer.id),{active:!offer.active});
    await updateDoc(doc(db,"products",offer.product_id),{has_offer:!offer.active});
  }

  const label=(txt:string)=><label style={{ display:"block",fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase" as const,color:S.text,opacity:0.4,marginBottom:"6px" }}>{txt}</label>;

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px" }}>
        <h2 style={{ fontSize:"14px",fontWeight:600,color:S.text }}>Active Offers</h2>
        <button onClick={()=>setAdding(!adding)} style={{ display:"flex",alignItems:"center",gap:"6px",padding:"8px 16px",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer" }}>
          <Plus size={13}/> New Offer
        </button>
      </div>

      <AnimatePresence>
        {adding&&(
          <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-10 }} style={{ background:S.surface,border:`1px solid ${S.border}`,padding:"20px",marginBottom:"20px" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>
              <div>
                {label("Product *")}
                <select value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})} style={{ ...S.input,cursor:"pointer" }}>
                  <option value="">Select product...</option>
                  {products.map(p=><option key={p.id} value={p.id}>{p.name_en} — {p.price} EGP</option>)}
                </select>
              </div>
              <div>{label("Offer Price (EGP) *")}<input type="number" value={form.discount_price||""} onChange={e=>setForm({...form,discount_price:Number(e.target.value)})} style={S.input}/></div>
              <div>{label("نص العرض (عربي)")}<input value={form.label_ar} onChange={e=>setForm({...form,label_ar:e.target.value})} style={{ ...S.input,direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/></div>
              <div>{label("Offer Label (EN)")}<input value={form.label_en} onChange={e=>setForm({...form,label_en:e.target.value})} style={S.input}/></div>
              <div>{label("Expires At")}<input type="datetime-local" value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})} style={S.input}/></div>
            </div>
            <div style={{ display:"flex",gap:"8px" }}>
              <button onClick={saveOffer} style={{ flex:1,padding:"10px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.1em",textTransform:"uppercase" }}>Create Offer</button>
              <button onClick={()=>setAdding(false)} style={{ padding:"10px 20px",background:"transparent",color:S.text,border:`1px solid ${S.border}`,cursor:"pointer",fontSize:"12px" }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
        {offers.map(offer=>{
          const isExpired=offer.expires_at&&new Date(offer.expires_at)<new Date();
          return (
            <div key={offer.id} style={{ display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",background:S.surface,border:`1px solid ${offer.active&&!isExpired?S.teal:S.border}` }}>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:"13px",fontWeight:500,color:S.text }}>{offer.product_name}</p>
                <p style={{ fontSize:"11px",color:S.text,opacity:0.4,marginTop:"2px" }}>{offer.discount_price} EGP · {offer.label_en}{offer.expires_at&&` · Expires: ${new Date(offer.expires_at).toLocaleDateString()}`}</p>
              </div>
              <div style={{ display:"flex",gap:"6px" }}>
                {isExpired&&<span style={{ fontSize:"9px",padding:"2px 8px",background:"#e74c3c",color:"#E8DCCA" }}>EXPIRED</span>}
                {!isExpired&&offer.active&&<span style={{ fontSize:"9px",padding:"2px 8px",background:S.teal,color:"#E8DCCA" }}>ACTIVE</span>}
                <button onClick={()=>toggleOffer(offer)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:S.text }}>{offer.active?<EyeOff size={11}/>:<Eye size={11}/>}</button>
                <button onClick={()=>deleteOffer(offer)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:"#e74c3c" }}><Trash2 size={11}/></button>
              </div>
            </div>
          );
        })}
        {offers.length===0&&<div style={{ textAlign:"center",padding:"3rem",opacity:0.2,color:S.text }}>No offers yet</div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ORDERS PANEL
// ══════════════════════════════════════════════════════════
const ORDER_STATUSES=["pending","confirmed","shipped","delivered","cancelled"];

function OrdersPanel() {
  const [orders,   setOrders]   = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});

  useEffect(()=>{
    const q=query(collection(db,"orders"),orderBy("created_at","desc"));
    const u1=onSnapshot(q,snap=>setOrders(snap.docs.map(d=>({id:d.id,...d.data()}))));
    const u2=onSnapshot(doc(db,"settings","store"),snap=>{ if(snap.exists()) setSettings(snap.data()); });
    return ()=>{ u1(); u2(); };
  },[]);

  async function updateStatus(id:string,status:string) {
    await updateDoc(doc(db,"orders",id),{status});
    toast.success("Updated");
  }

  async function deleteOrder(order: any) {
    if (!confirm("Delete this order permanently?")) return;
    // Build WhatsApp notification
    const msg = (settings.order_deleted_sms_ar||"عزيزي العميل، تم إلغاء طلبك رقم {order_id} من قِبل المتجر.")
      .replace("{order_id}", `#${order.id.slice(-8).toUpperCase()}`)
      .replace("{customer_name}", order.customer?.full_name||"");
    const phone = order.customer?.phone?.replace(/[^0-9]/g,"");
    if (phone) {
      const waUrl=`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl,"_blank");
    }
    await deleteDoc(doc(db,"orders",order.id));
    setSelected(null);
    toast.success("Order deleted");
  }

  const statusColor: Record<string,string>={pending:"#e67e22",confirmed:"#3498db",shipped:"#9b59b6",delivered:S.teal,cancelled:"#e74c3c"};

  return (
    <div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))",gap:"10px",marginBottom:"20px" }}>
        {ORDER_STATUSES.map(s=>(
          <div key={s} style={{ padding:"12px",background:S.surface,border:`1px solid ${S.border}`,textAlign:"center" }}>
            <p style={{ fontSize:"9px",opacity:0.35,textTransform:"uppercase",letterSpacing:"0.1em",color:S.text,marginBottom:"4px" }}>{s}</p>
            <p style={{ fontSize:"1.5rem",fontWeight:600,color:statusColor[s]||S.text,fontFamily:"Cormorant Garamond, serif" }}>{orders.filter(o=>o.status===s).length}</p>
          </div>
        ))}
      </div>

      <div style={{ display:"flex",flexDirection:"column",gap:"2px" }}>
        {orders.map(order=>(
          <div key={order.id} style={{ display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",background:S.surface,border:`1px solid ${S.border}`,cursor:"pointer" }}
            onClick={()=>setSelected(selected?.id===order.id?null:order)}>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:"12px",color:S.text,fontFamily:"monospace" }}>#{order.id?.slice(-8)}</p>
              <p style={{ fontSize:"11px",color:S.text,opacity:0.4,marginTop:"2px" }}>
                {order.customer?.full_name} · {order.customer?.phone}
                {" · "}{order.items?.reduce((t:number,i:any)=>t+(i.quantity||1),0)} pcs
                {" · "}{order.total?.toLocaleString()} EGP
              </p>
            </div>
            <span style={{ fontSize:"10px",padding:"3px 10px",letterSpacing:"0.1em",textTransform:"uppercase",background:statusColor[order.status]||S.border,color:"#E8DCCA" }}>{order.status}</span>
          </div>
        ))}
        {orders.length===0&&<div style={{ textAlign:"center",padding:"4rem",opacity:0.2,color:S.text }}>No orders yet</div>}
      </div>

      <AnimatePresence>
        {selected&&(
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"flex-end",justifyContent:"center" }}>
            <div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,0.6)" }} onClick={()=>setSelected(null)}/>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} transition={{ duration:0.35 }}
              style={{ position:"relative",width:"100%",maxWidth:"560px",maxHeight:"85vh",overflowY:"auto",background:S.bg,border:`1px solid ${S.border}`,padding:"24px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px" }}>
                <h3 style={{ fontSize:"14px",fontWeight:600,color:S.text }}>#{selected.id?.slice(-8).toUpperCase()}</h3>
                <button onClick={()=>deleteOrder(selected)} style={{ display:"flex",alignItems:"center",gap:"5px",padding:"6px 12px",background:"rgba(231,76,60,0.15)",border:"1px solid #e74c3c",color:"#e74c3c",cursor:"pointer",fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase" }}>
                  <Trash2 size={11}/> Delete & Notify
                </button>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"16px" }}>
                {[["Name",selected.customer?.full_name],["Phone",selected.customer?.phone],["City",selected.customer?.city],["Street",selected.customer?.street],["Total",`${selected.total?.toLocaleString()} EGP`]].map(([k,v])=>(
                  <div key={k}><p style={{ fontSize:"9px",opacity:0.35,textTransform:"uppercase",letterSpacing:"0.1em",color:S.text,marginBottom:"3px" }}>{k}</p><p style={{ fontSize:"13px",color:S.text }}>{v}</p></div>
                ))}
              </div>

              {/* Items with individual quantities */}
              <p style={{ fontSize:"10px",opacity:0.3,textTransform:"uppercase",letterSpacing:"0.1em",color:S.text,marginBottom:"8px" }}>Items</p>
              {selected.items?.map((item:any,i:number)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${S.border}` }}>
                  <div>
                    <p style={{ fontSize:"12px",color:S.text }}>{item.name_en}</p>
                    <p style={{ fontSize:"10px",color:S.text,opacity:0.4 }}>Size: {item.size}</p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:"12px",color:S.text }}>× {item.quantity} pcs</p>
                    <p style={{ fontSize:"11px",color:S.text,opacity:0.5 }}>{(item.price*item.quantity).toLocaleString()} EGP</p>
                  </div>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${S.border}`,marginBottom:"16px" }}>
                <p style={{ fontSize:"12px",fontWeight:600,color:S.text }}>
                  Total: {selected.items?.reduce((t:number,i:any)=>t+(i.quantity||1),0)} pcs
                </p>
                <p style={{ fontSize:"12px",fontWeight:600,color:S.text }}>{selected.total?.toLocaleString()} EGP</p>
              </div>

              <p style={{ fontSize:"10px",opacity:0.3,textTransform:"uppercase",letterSpacing:"0.1em",color:S.text,marginBottom:"8px" }}>Update Status</p>
              <div style={{ display:"flex",gap:"6px",flexWrap:"wrap" }}>
                {ORDER_STATUSES.map(s=>(
                  <button key={s} onClick={()=>{ updateStatus(selected.id,s); setSelected({...selected,status:s}); }}
                    style={{ padding:"6px 14px",fontSize:"10px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",background:selected.status===s?statusColor[s]:"transparent",color:S.text,border:`1px solid ${selected.status===s?statusColor[s]:S.border}` }}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SECTIONS PANEL
// ══════════════════════════════════════════════════════════
function SectionsPanel() {
  const [sections,       setSections]       = useState<Record<string,any>>({});
  const [editingSection, setEditingSection] = useState<string|null>(null);
  const [newSubAr,       setNewSubAr]       = useState("");
  const [newSubEn,       setNewSubEn]       = useState("");

  useEffect(()=>{ return onSnapshot(collection(db,"sections"),snap=>{ const d:Record<string,any>={}; snap.forEach(s=>{d[s.id]={id:s.id,...s.data()}}); setSections(d); }); },[]);

  async function toggle(id:string,cur:boolean){ await updateDoc(doc(db,"sections",id),{visible:!cur}); }

  async function addSub(sectionId:string){
    if(!newSubAr||!newSubEn){ toast.error("Enter both AR and EN names"); return; }
    const section=sections[sectionId];
    const subs=section.subcategories||[];
    const newSub={slug:newSubEn.toLowerCase().replace(/\s+/g,"-"),name_ar:newSubAr,name_en:newSubEn};
    await updateDoc(doc(db,"sections",sectionId),{subcategories:[...subs,newSub]});
    setNewSubAr(""); setNewSubEn(""); toast.success("Added");
  }

  async function removeSub(sectionId:string,slug:string){
    const subs=(sections[sectionId].subcategories||[]).filter((s:any)=>s.slug!==slug);
    await updateDoc(doc(db,"sections",sectionId),{subcategories:subs});
  }

  const sorted=Object.values(sections).sort((a:any,b:any)=>a.order-b.order);

  return (
    <div>
      <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
        {sorted.map((s:any)=>(
          <div key={s.id} style={{ background:S.surface,border:`1px solid ${S.border}` }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
                <button onClick={()=>setEditingSection(editingSection===s.id?null:s.id)} style={{ background:"none",border:"none",cursor:"pointer",color:S.text,opacity:0.4,fontSize:"12px" }}>{editingSection===s.id?"▲":"▼"}</button>
                <div>
                  <p style={{ fontSize:"13px",color:S.text,fontWeight:500 }}>{s.name_en}</p>
                  <p style={{ fontSize:"11px",color:S.text,opacity:0.35,direction:"rtl",marginTop:"2px" }}>{s.name_ar}</p>
                </div>
              </div>
              <button onClick={()=>toggle(s.id,s.visible)} style={{ display:"flex",alignItems:"center",gap:"5px",padding:"6px 14px",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.1em",cursor:"pointer",background:s.visible?S.teal:"transparent",color:s.visible?"#E8DCCA":S.text,border:`1px solid ${s.visible?S.teal:S.border}` }}>
                {s.visible?<Eye size={11}/>:<EyeOff size={11}/>}{s.visible?"Visible":"Hidden"}
              </button>
            </div>

            {editingSection===s.id&&(
              <div style={{ borderTop:`1px solid ${S.border}`,padding:"14px 16px" }}>
                <p style={{ fontSize:"10px",opacity:0.35,textTransform:"uppercase",letterSpacing:"0.12em",color:S.text,marginBottom:"10px" }}>Subcategories ({(s.subcategories||[]).length})</p>
                <div style={{ display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"12px" }}>
                  {(s.subcategories||[]).map((sub:any)=>(
                    <div key={sub.slug} style={{ display:"flex",alignItems:"center",gap:"4px",padding:"4px 10px",background:S.surface2,border:`1px solid ${S.border}` }}>
                      <span style={{ fontSize:"11px",color:S.text }}>{sub.name_en}</span>
                      <span style={{ fontSize:"9px",color:S.text,opacity:0.3,direction:"rtl" }}>/{sub.name_ar}</span>
                      <button onClick={()=>removeSub(s.id,sub.slug)} style={{ background:"none",border:"none",cursor:"pointer",color:"#e74c3c",padding:"1px",marginLeft:"4px" }}><X size={10}/></button>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",gap:"8px",flexWrap:"wrap" }}>
                  <input value={newSubAr} onChange={e=>setNewSubAr(e.target.value)} placeholder="اسم عربي" style={{ ...S.input,width:"120px",direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/>
                  <input value={newSubEn} onChange={e=>setNewSubEn(e.target.value)} placeholder="English name" style={{ ...S.input,width:"140px" }}/>
                  <button onClick={()=>addSub(s.id)} style={{ padding:"10px 14px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer" }}><Plus size={12}/></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// CONTENT PANEL
// ══════════════════════════════════════════════════════════
function ContentPanel() {
  const [page,  setPage]  = useState("home");
  const [data,  setData]  = useState<Record<string,string>>({});
  const [dirty, setDirty] = useState(false);
  const pages=["home","footer","about"];

  useEffect(()=>{ setDirty(false); return onSnapshot(doc(db,"content",page),snap=>{ if(snap.exists()) setData(snap.data() as Record<string,string>); }); },[page]);

  async function save(){ await updateDoc(doc(db,"content",page),data); toast.success("✓ Saved"); setDirty(false); }

  return (
    <div>
      <div style={{ display:"flex",gap:"8px",marginBottom:"24px" }}>
        {pages.map(p=><button key={p} onClick={()=>setPage(p)} style={{ padding:"6px 16px",fontSize:"11px",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",background:page===p?S.red:"transparent",color:S.text,border:`1px solid ${page===p?S.red:S.border}` }}>{p}</button>)}
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
        {Object.entries(data).map(([k,v])=>(
          <div key={k}>
            <label style={{ display:"block",fontSize:"9px",opacity:0.35,letterSpacing:"0.12em",textTransform:"uppercase",color:S.text,marginBottom:"5px" }}>{k}</label>
            <textarea value={v||""} onChange={e=>{ setData({...data,[k]:e.target.value}); setDirty(true); }} rows={2}
              style={{ ...S.input,resize:"none",direction:k.endsWith("_ar")?"rtl":"ltr",fontFamily:k.endsWith("_ar")?"Aref Ruqaa, serif":"inherit" }}/>
          </div>
        ))}
      </div>
      {dirty&&<button onClick={save} style={{ display:"flex",alignItems:"center",gap:"8px",marginTop:"20px",padding:"10px 24px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.12em",textTransform:"uppercase" }}><Save size={13}/>Save</button>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// THEME PANEL
// ══════════════════════════════════════════════════════════
function ThemePanel() {
  const [theme,setTheme]=useState({light_bg:"#E8DCCA",light_text:"#38040E",dark_bg:"#1A2238",dark_text:"#E8DCCA",accent:"#305252"});
  useEffect(()=>{ return onSnapshot(doc(db,"settings","theme"),snap=>{ if(snap.exists()) setTheme(snap.data() as any); }); },[]);
  async function save(){ await updateDoc(doc(db,"settings","theme"),theme); toast.success("✓ Theme saved"); }
  const rows:[keyof typeof theme,string][]=[["light_bg","Light BG"],["light_text","Light Text"],["dark_bg","Dark BG"],["dark_text","Dark Text"],["accent","Accent"]];
  return (
    <div style={{ maxWidth:"480px" }}>
      {rows.map(([k,l])=>(
        <div key={k} style={{ marginBottom:"20px" }}>
          <p style={{ fontSize:"10px",opacity:0.35,textTransform:"uppercase",letterSpacing:"0.12em",color:S.text,marginBottom:"10px" }}>{l}</p>
          <div style={{ display:"flex",alignItems:"center",gap:"8px",flexWrap:"wrap" }}>
            {BRAND_COLORS.map(c=>(
              <button key={c.hex} onClick={()=>setTheme({...theme,[k]:c.hex})} title={c.name}
                style={{ width:"36px",height:"36px",background:c.hex,border:`3px solid ${theme[k]===c.hex?"#E8DCCA":"transparent"}`,cursor:"pointer",transform:theme[k]===c.hex?"scale(1.1)":"scale(1)",transition:"all 0.2s" }}/>
            ))}
            <span style={{ fontSize:"11px",color:S.text,opacity:0.4,fontFamily:"monospace" }}>{theme[k]}</span>
          </div>
        </div>
      ))}
      <button onClick={save} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.12em",textTransform:"uppercase" }}><Save size={13}/>Save</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SOCIAL PANEL
// ══════════════════════════════════════════════════════════
function SocialPanel() {
  const [social,setSocial]=useState<Record<string,any>>({});
  useEffect(()=>{ return onSnapshot(doc(db,"settings","social"),snap=>{ if(snap.exists()) setSocial(snap.data()); }); },[]);
  async function update(key:string,field:string,value:any){ const upd={...social,[key]:{...social[key],[field]:value}}; setSocial(upd); await updateDoc(doc(db,"settings","social"),upd); }
  return (
    <div>
      <h2 style={{ fontSize:"14px",fontWeight:600,color:S.text,marginBottom:"20px" }}>Social Media</h2>
      <div style={{ display:"flex",flexDirection:"column",gap:"10px" }}>
        {Object.entries(social).sort(([,a]:any,[,b]:any)=>a.order-b.order).map(([k,v]:any)=>(
          <div key={k} style={{ display:"flex",alignItems:"center",gap:"10px",padding:"14px 16px",background:S.surface,border:`1px solid ${S.border}` }}>
            <span style={{ fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.1em",color:S.text,opacity:0.5,width:"80px",flexShrink:0 }}>{k}</span>
            <input type="url" value={v.url||""} onChange={e=>update(k,"url",e.target.value)} placeholder={`https://${k}.com/...`} style={{ ...S.input,flex:1 }}/>
            <button onClick={()=>update(k,"visible",!v.visible)} style={{ display:"flex",alignItems:"center",gap:"5px",padding:"7px 14px",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.1em",cursor:"pointer",background:v.visible?S.teal:"transparent",color:v.visible?"#E8DCCA":S.text,border:`1px solid ${v.visible?S.teal:S.border}`,flexShrink:0 }}>
              {v.visible?<Eye size={11}/>:<EyeOff size={11}/>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAINTENANCE PANEL
// ══════════════════════════════════════════════════════════
function MaintenancePanel() {
  const [data,setData]=useState({is_active:false,message_ar:"",message_en:"",estimated_time:""});
  useEffect(()=>{ return onSnapshot(doc(db,"settings","maintenance"),snap=>{ if(snap.exists()) setData(snap.data() as any); }); },[]);
  async function save(){ await setDoc(doc(db,"settings","maintenance"),data,{merge:true}); toast.success(data.is_active?"⚠️ Maintenance ON":"✓ Site is live"); }
  return (
    <div style={{ maxWidth:"480px" }}>
      <div style={{ padding:"16px",background:data.is_active?"rgba(56,4,14,0.3)":S.surface,border:`1px solid ${data.is_active?S.red:S.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"20px" }}>
        <div>
          <p style={{ fontSize:"13px",color:S.text }}>Site Status</p>
          <p style={{ fontSize:"11px",color:data.is_active?"#e74c3c":"#2ecc71",marginTop:"2px" }}>{data.is_active?"🔴 Under Maintenance":"🟢 Live"}</p>
        </div>
        <button onClick={()=>setData({...data,is_active:!data.is_active})} style={{ display:"flex",alignItems:"center",gap:"6px",padding:"8px 18px",fontSize:"11px",textTransform:"uppercase",letterSpacing:"0.1em",cursor:"pointer",background:data.is_active?S.red:"transparent",color:data.is_active?"#E8DCCA":S.text,border:`1px solid ${data.is_active?S.red:S.border}` }}>
          <Power size={13}/>{data.is_active?"Disable":"Enable"}
        </button>
      </div>
      {[{k:"message_ar",l:"رسالة الصيانة (عربي)",d:"rtl"},{k:"message_en",l:"Message (EN)",d:"ltr"},{k:"estimated_time",l:"Estimated Return Time",d:"ltr"}].map(({k,l,d})=>(
        <div key={k} style={{ marginBottom:"14px" }}>
          <label style={{ display:"block",fontSize:"10px",opacity:0.35,textTransform:"uppercase",letterSpacing:"0.12em",color:S.text,marginBottom:"6px" }}>{l}</label>
          <input type="text" value={(data as any)[k]||""} onChange={e=>setData({...data,[k]:e.target.value})} dir={d} style={{ ...S.input,fontFamily:d==="rtl"?"Aref Ruqaa, serif":"inherit" }}/>
        </div>
      ))}
      <button onClick={save} style={{ display:"flex",alignItems:"center",gap:"8px",padding:"10px 24px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.12em",textTransform:"uppercase" }}><Save size={13}/>Save</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MESSAGES PANEL
// ══════════════════════════════════════════════════════════
function MessagesPanel() {
  const [msgs,    setMsgs]    = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyText,setReplyText]=useState("");

  useEffect(()=>{ const q=query(collection(db,"messages"),orderBy("created_at","desc")); return onSnapshot(q,snap=>setMsgs(snap.docs.map(d=>({id:d.id,...d.data()})))); },[]);

  async function markRead(id:string){ await updateDoc(doc(db,"messages",id),{read:true}); }
  async function del(id:string){ if(!confirm("Delete?"))return; await deleteDoc(doc(db,"messages",id)); toast.success("Deleted"); }

  function openReply(msg:any){ setReplyTo(msg); setReplyText(`\n\n---\nIn reply to: "${msg.message?.slice(0,60)}..."`); markRead(msg.id); }
  function sendReply(){ if(!replyTo?.email){ toast.error("No email"); return; } window.open(`mailto:${replyTo.email}?subject=Re: Your message to zeyy&body=${encodeURIComponent(replyText)}`); setReplyTo(null); setReplyText(""); }

  return (
    <div>
      <h2 style={{ fontSize:"14px",fontWeight:600,color:S.text,marginBottom:"20px" }}>Messages ({msgs.filter(m=>!m.read).length} unread)</h2>
      <div style={{ display:"flex",flexDirection:"column",gap:"8px" }}>
        {msgs.map(m=>(
          <div key={m.id} style={{ padding:"16px",background:m.read?S.surface:S.surface2,border:`1px solid ${m.read?S.border:"rgba(56,4,14,0.5)"}` }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px" }}>
              <div>
                <p style={{ fontSize:"13px",fontWeight:m.read?400:600,color:S.text }}>{m.name}</p>
                <p style={{ fontSize:"11px",color:S.text,opacity:0.4,marginTop:"2px" }}>{m.email}</p>
              </div>
              <div style={{ display:"flex",gap:"4px" }}>
                {!m.read&&<span style={{ fontSize:"8px",padding:"2px 7px",background:S.red,color:"#E8DCCA",letterSpacing:"0.1em" }}>NEW</span>}
                <button onClick={()=>openReply(m)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:S.text }}><Reply size={11}/></button>
                <button onClick={()=>window.open(`mailto:${m.email}`)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:S.text }}><Mail size={11}/></button>
                <button onClick={()=>del(m.id)} style={{ width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",background:"transparent",border:`1px solid ${S.border}`,cursor:"pointer",color:"#e74c3c" }}><Trash2 size={11}/></button>
              </div>
            </div>
            <p style={{ fontSize:"12px",color:S.text,opacity:0.7,lineHeight:1.6 }} onClick={()=>markRead(m.id)}>{m.message}</p>
          </div>
        ))}
        {msgs.length===0&&<div style={{ textAlign:"center",padding:"3rem",opacity:0.2,color:S.text }}>No messages</div>}
      </div>

      <AnimatePresence>
        {replyTo&&(
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ position:"fixed",inset:0,zIndex:60,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)" }}>
            <motion.div initial={{ y:20,opacity:0 }} animate={{ y:0,opacity:1 }} style={{ background:S.bg,border:`1px solid ${S.border}`,padding:"24px",width:"100%",maxWidth:"480px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:"16px" }}>
                <p style={{ fontSize:"13px",fontWeight:600,color:S.text }}>Reply to {replyTo.name}</p>
                <button onClick={()=>setReplyTo(null)} style={{ background:"none",border:"none",cursor:"pointer",color:S.text,opacity:0.4 }}><X size={16}/></button>
              </div>
              <p style={{ fontSize:"11px",color:S.text,opacity:0.4,marginBottom:"12px" }}>To: {replyTo.email}</p>
              <textarea rows={6} value={replyText} onChange={e=>setReplyText(e.target.value)} style={{ ...S.input,resize:"none",marginBottom:"12px" }}/>
              <div style={{ display:"flex",gap:"8px" }}>
                <button onClick={sendReply} style={{ flex:1,padding:"10px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px" }}><Mail size={13}/>Open Mail App</button>
                <button onClick={()=>setReplyTo(null)} style={{ padding:"10px 16px",background:"transparent",border:`1px solid ${S.border}`,color:S.text,cursor:"pointer",fontSize:"12px" }}>Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ✅ SETTINGS PANEL — FULLY INTEGRATED
// ══════════════════════════════════════════════════════════
function SettingsPanel() {
  const DEFAULTS = {
    store_name_ar:"زِيّ", store_name_en:"zeyy", store_email:"",
    whatsapp_number:"01121454510",
    whatsapp_message_ar:"مرحباً، أريد الاستفسار عن طلبي 🛍️",
    whatsapp_message_en:"Hello, I need help with my order 🛍️",
    cancel_whatsapp_msg_ar:"مرحباً، أريد إلغاء طلبي رقم: {order_id}",
    cancel_whatsapp_msg_en:"Hello, I want to cancel my order: {order_id}",
    order_deleted_sms_ar:"عزيزي العميل، تم إلغاء طلبك رقم {order_id} من قِبل المتجر. للاستفسار تواصل معنا.",
    order_deleted_sms_en:"Dear customer, your order {order_id} has been cancelled by the store.",
    currency_ar:"ج.م", currency_en:"EGP",
  };

  const [data,   setData]   = useState(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ return onSnapshot(doc(db,"settings","store"),snap=>{ if(snap.exists()) setData({...DEFAULTS,...snap.data()} as any); }); },[]);

  function set(k:string,v:string){ setData(d=>({...d,[k]:v})); }

  async function save(){
    setSaving(true);
    try{ await setDoc(doc(db,"settings","store"),data,{merge:true}); toast.success("✓ Settings saved"); }
    catch{ toast.error("Save failed"); }
    finally{ setSaving(false); }
  }

  const label=(txt:string)=><label style={{ display:"block",fontSize:"10px",letterSpacing:"0.12em",textTransform:"uppercase" as const,color:S.text,opacity:0.4,marginBottom:"6px" }}>{txt}</label>;
  const sectionTitle=(txt:string,icon:React.ReactNode)=>(
    <div style={{ display:"flex",alignItems:"center",gap:"8px",marginBottom:"16px",paddingBottom:"12px",borderBottom:`1px solid ${S.border}` }}>
      <div style={{ color:S.red,opacity:0.8 }}>{icon}</div>
      <p style={{ fontSize:"13px",fontWeight:600,color:S.text }}>{txt}</p>
    </div>
  );

  return (
    <div style={{ maxWidth:"600px" }}>
      <h2 style={{ fontSize:"16px",fontWeight:600,color:S.text,marginBottom:"28px" }}>⚙️ Store Settings</h2>

      {/* Store Info */}
      <div style={{ background:S.surface,border:`1px solid ${S.border}`,padding:"20px",marginBottom:"16px" }}>
        {sectionTitle("Store Information",<Store size={16}/>)}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>
          <div>{label("اسم المتجر (عربي)")}<input value={data.store_name_ar} onChange={e=>set("store_name_ar",e.target.value)} style={{ ...S.input,direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/></div>
          <div>{label("Store Name (EN)")}<input value={data.store_name_en} onChange={e=>set("store_name_en",e.target.value)} style={S.input}/></div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
          <div>{label("العملة (عربي)")}<input value={data.currency_ar} onChange={e=>set("currency_ar",e.target.value)} style={S.input} placeholder="ج.م"/></div>
          <div>{label("Currency (EN)")}<input value={data.currency_en} onChange={e=>set("currency_en",e.target.value)} style={S.input} placeholder="EGP"/></div>
        </div>
      </div>

      {/* WhatsApp */}
      <div style={{ background:S.surface,border:`1px solid ${S.border}`,padding:"20px",marginBottom:"16px" }}>
        {sectionTitle("WhatsApp Support",<MessageCircle size={16}/>)}
        <div style={{ marginBottom:"12px" }}>
          {label("WhatsApp Number")}
          <input value={data.whatsapp_number} onChange={e=>set("whatsapp_number",e.target.value)} style={S.input} placeholder="01121454510"/>
          <p style={{ fontSize:"10px",color:S.text,opacity:0.25,marginTop:"4px" }}>Without + or spaces</p>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px" }}>
          <div>{label("رسالة الدعم (عربي)")}<textarea value={data.whatsapp_message_ar} onChange={e=>set("whatsapp_message_ar",e.target.value)} rows={3} style={{ ...S.input,resize:"none",direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/></div>
          <div>{label("Support Message (EN)")}<textarea value={data.whatsapp_message_en} onChange={e=>set("whatsapp_message_en",e.target.value)} rows={3} style={{ ...S.input,resize:"none" }}/></div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
          <div>
            {label("رسالة إلغاء الطلب (عربي)")}
            <textarea value={data.cancel_whatsapp_msg_ar} onChange={e=>set("cancel_whatsapp_msg_ar",e.target.value)} rows={3} style={{ ...S.input,resize:"none",direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/>
            <p style={{ fontSize:"9px",color:S.text,opacity:0.2,marginTop:"3px" }}>استخدم {"{order_id}"} لرقم الطلب</p>
          </div>
          <div>{label("Cancel Order Message (EN)")}<textarea value={data.cancel_whatsapp_msg_en} onChange={e=>set("cancel_whatsapp_msg_en",e.target.value)} rows={3} style={{ ...S.input,resize:"none" }}/></div>
        </div>
      </div>

      {/* Delete notification */}
      <div style={{ background:S.surface,border:`1px solid ${S.border}`,padding:"20px",marginBottom:"20px" }}>
        {sectionTitle("Order Deletion Message",<Mail size={16}/>)}
        <p style={{ fontSize:"11px",color:S.text,opacity:0.35,marginBottom:"12px" }}>Sent to customer when you delete their order. Use {"{order_id}"} and {"{customer_name}"}.</p>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px" }}>
          <div>{label("رسالة الحذف (عربي)")}<textarea value={data.order_deleted_sms_ar} onChange={e=>set("order_deleted_sms_ar",e.target.value)} rows={4} style={{ ...S.input,resize:"none",direction:"rtl",fontFamily:"Aref Ruqaa, serif" }}/></div>
          <div>{label("Deletion Message (EN)")}<textarea value={data.order_deleted_sms_en} onChange={e=>set("order_deleted_sms_en",e.target.value)} rows={4} style={{ ...S.input,resize:"none" }}/></div>
        </div>
      </div>

      <button onClick={save} disabled={saving} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",width:"100%",padding:"14px",background:S.red,color:"#E8DCCA",border:"none",cursor:"pointer",fontSize:"12px",letterSpacing:"0.15em",textTransform:"uppercase",opacity:saving?0.6:1 }}>
        <Save size={14}/>{saving?"Saving...":"Save Settings"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN ADMIN PAGE
// ══════════════════════════════════════════════════════════
export default function AdminPage() {
  const [user,        setUser]        = useState<any>(null);
  const [checking,    setChecking]    = useState(true);
  const [activeTab,   setActiveTab]   = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(()=>{ return onAuthStateChanged(auth,u=>{ setUser(u); setChecking(false); }); },[]);

  if (checking) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:S.red }}>
      <div style={{ width:"2px",height:"40px",background:"#E8DCCA",opacity:0.6 }}/>
    </div>
  );
  if (!user) return <LoginScreen/>;

  const PANEL: Record<Tab, React.ReactNode> = {
    dashboard:   <DashboardPanel/>,
    products:    <ProductsPanel/>,
    stock:       <StockPanel/>,
    offers:      <OffersPanel/>,
    orders:      <OrdersPanel/>,
    sections:    <SectionsPanel/>,
    content:     <ContentPanel/>,
    theme:       <ThemePanel/>,
    social:      <SocialPanel/>,
    maintenance: <MaintenancePanel/>,
    messages:    <MessagesPanel/>,
    settings:    <SettingsPanel/>,
  };

  return (
    <div style={{ minHeight:"100vh",display:"flex",background:S.bg,color:S.text,fontFamily:"Cormorant Garamond, serif" }}>
      <AnimatePresence initial={false}>
        {sidebarOpen&&(
          <motion.aside initial={{ width:0 }} animate={{ width:220 }} exit={{ width:0 }} transition={{ duration:0.3 }}
            style={{ flexShrink:0,display:"flex",flexDirection:"column",background:S.surface,borderRight:`1px solid ${S.border}`,overflow:"hidden" }}>
            <div style={{ padding:"20px 20px 16px",borderBottom:`1px solid ${S.border}` }}>
              <p style={{ fontSize:"1.3rem",fontWeight:600,color:S.text }}>zeyy</p>
              <p style={{ fontSize:"9px",opacity:0.25,letterSpacing:"0.15em",textTransform:"uppercase",marginTop:"2px" }}>Manager</p>
            </div>
            <nav style={{ flex:1,overflowY:"auto",padding:"8px 0" }}>
              {TABS.map(tab=>{
                const Icon=tab.icon; const active=activeTab===tab.id;
                return (
                  <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                    style={{ width:"100%",display:"flex",alignItems:"center",gap:"10px",padding:"11px 20px",fontSize:"12px",letterSpacing:"0.05em",textAlign:"left",cursor:"pointer",background:active?"rgba(56,4,14,0.4)":"transparent",color:active?S.text:"rgba(232,220,202,0.45)",border:"none",borderLeft:active?"2px solid #38040E":"2px solid transparent",transition:"all 0.2s" }}>
                    <Icon size={14} strokeWidth={1.5}/>{tab.label}
                  </button>
                );
              })}
            </nav>
            <div style={{ padding:"16px 20px",borderTop:`1px solid ${S.border}` }}>
              <button onClick={()=>signOut(auth)} style={{ display:"flex",alignItems:"center",gap:"8px",fontSize:"11px",color:S.text,opacity:0.3,background:"none",border:"none",cursor:"pointer" }}>
                <LogOut size={13}/>Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>
        <header style={{ display:"flex",alignItems:"center",gap:"12px",padding:"14px 24px",borderBottom:`1px solid ${S.border}`,background:S.surface,position:"sticky",top:0,zIndex:10 }}>
          <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{ background:"none",border:"none",cursor:"pointer",color:S.text,opacity:0.4 }}>
            <ChevronRight size={16} style={{ transform:sidebarOpen?"rotate(180deg)":"rotate(0)",transition:"transform 0.3s" }}/>
          </button>
          <span style={{ fontSize:"13px",fontWeight:500,color:S.text,opacity:0.7 }}>{TABS.find(t=>t.id===activeTab)?.label}</span>
          <span style={{ marginLeft:"auto",fontSize:"11px",color:S.text,opacity:0.25 }}>{user.email}</span>
        </header>
        <main style={{ flex:1,padding:"28px",overflowY:"auto" }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
              {PANEL[activeTab]}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
