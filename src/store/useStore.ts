// src/store/useStore.ts
// ─────────────────────────────────────────────────────────
// ZEYY | Global State — Zustand
// ─────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ─────────────────────────────────────────────────

export type Lang = "ar" | "en";

export type CartItem = {
  id:       string;
  name_ar:  string;
  name_en:  string;
  price:    number;
  size:     string;
  quantity: number;
  image:    string;
  slug:     string;
};

export type ThemeMode = "light" | "dark";

interface ZeyyStore {
  // Language
  lang:      Lang;
  setLang:   (lang: Lang) => void;
  t:         (ar: string, en: string) => string;

  // Cart
  cart:            CartItem[];
  addToCart:       (item: CartItem) => void;
  removeFromCart:  (id: string, size: string) => void;
  updateQuantity:  (id: string, size: string, qty: number) => void;
  clearCart:       () => void;
  cartTotal:       () => number;
  cartCount:       () => number;

  // UI
  cartOpen:    boolean;
  setCartOpen: (v: boolean) => void;
  menuOpen:    boolean;
  setMenuOpen: (v: boolean) => void;
}

// ── Store ─────────────────────────────────────────────────

export const useStore = create<ZeyyStore>()(
  persist(
    (set, get) => ({
      // ── Language ────────────────────────────────────────
      lang: "ar",
      setLang: (lang) => set({ lang }),
      t: (ar, en) => (get().lang === "ar" ? ar : en),

      // ── Cart ────────────────────────────────────────────
      cart: [],

      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find(
          (c) => c.id === item.id && c.size === item.size
        );
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id && c.size === item.size
                ? { ...c, quantity: c.quantity + item.quantity }
                : c
            ),
          });
        } else {
          set({ cart: [...cart, item] });
        }
      },

      removeFromCart: (id, size) =>
        set({ cart: get().cart.filter((c) => !(c.id === id && c.size === size)) }),

      updateQuantity: (id, size, qty) =>
        set({
          cart: get().cart.map((c) =>
            c.id === id && c.size === size ? { ...c, quantity: qty } : c
          ),
        }),

      clearCart: () => set({ cart: [] }),

      cartTotal: () =>
        get().cart.reduce((sum, c) => sum + c.price * c.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, c) => sum + c.quantity, 0),

      // ── UI ───────────────────────────────────────────────
      cartOpen:    false,
      setCartOpen: (v) => set({ cartOpen: v }),
      menuOpen:    false,
      setMenuOpen: (v) => set({ menuOpen: v }),
    }),
    {
      name: "zeyy-store",
      partialize: (state) => ({ cart: state.cart, lang: state.lang }),
    }
  )
);
