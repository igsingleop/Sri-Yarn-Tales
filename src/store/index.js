import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatINR } from "../lib/utils";

// ---- Cart Store ----
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      couponDiscount: 0,

      addItem: (product, variant = {}, qty = 1, note = "") => {
        const key = `${product.id}-${variant.color || ""}-${variant.size || ""}`;
        set((state) => {
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, qty: i.qty + qty } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { key, product, variant, qty, note, addedAt: Date.now() },
            ],
          };
        });
      },

      removeItem: (key) =>
        set((state) => ({ items: state.items.filter((i) => i.key !== key) })),

      updateQty: (key, qty) => {
        if (qty <= 0) {
          get().removeItem(key);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, qty } : i)),
        }));
      },

      updateNote: (key, note) =>
        set((state) => ({
          items: state.items.map((i) => (i.key === key ? { ...i, note } : i)),
        })),

      clearCart: () => set({ items: [], coupon: null, couponDiscount: 0 }),

      setCoupon: (coupon, discount) =>
        set({ coupon, couponDiscount: discount }),
      clearCoupon: () => set({ coupon: null, couponDiscount: 0 }),

      // Derived
      get itemCount() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },
      get subtotal() {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.qty,
          0
        );
      },
      get shippingCost() {
        const sub = get().subtotal;
        return sub >= 999 ? 0 : 99;
      },
      get discount() {
        const { coupon, couponDiscount, subtotal } = get();
        if (!coupon) return 0;
        if (coupon.type === "percent") {
          return Math.round((subtotal * couponDiscount) / 100);
        }
        return couponDiscount;
      },
      get total() {
        const { subtotal, shippingCost, discount } = get();
        return subtotal + shippingCost - discount;
      },
    }),
    { name: "syt-cart" }
  )
);

// ---- Wishlist Store ----
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (product) => {
        const exists = get().items.some((p) => p.id === product.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((p) => p.id !== product.id),
          }));
        } else {
          set((state) => ({ items: [...state.items, product] }));
        }
      },

      isWishlisted: (productId) =>
        get().items.some((p) => p.id === productId),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((p) => p.id !== productId),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: "syt-wishlist" }
  )
);

// ---- UI Store ----
export const useUIStore = create((set) => ({
  cartOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  openMobileMenu: () => set({ mobileMenuOpen: true }),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),

  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));

export { useAuthStore } from "./authStore";
export { useProductStore } from "./productStore";
export { useBannerStore } from "./bannerStore";
