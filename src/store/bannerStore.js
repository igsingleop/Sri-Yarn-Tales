import { create } from "zustand";
import { persist } from "zustand/middleware";
import { broadcastSync } from "./sync";

const DEFAULT_BANNER_STATE = {
  topAnnouncement: {
    enabled: true,
    text: "Free shipping on orders above ₹999 · Handmade with love 🧶",
    badge: "Special Offer",
    badgeText: "Use code WELCOME10 for 10% off your first order!",
    bgColor: "#D4768A",
  },
  heroBanner: {
    eyebrow: "Crafted with love in India",
    headline: "Handmade Crochet, Woven With Love",
    subtext: "Discover one-of-a-kind amigurumi toys, bags, home decor, and wearables — each piece handcrafted with premium soft yarn and shipped lovingly across India.",
    primaryBtnText: "Shop Now",
    primaryBtnLink: "/shop",
    secondaryBtnText: "Order Custom",
    secondaryBtnLink: "/custom-orders",
    heroImages: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1568760970073-ce3f8af8cb72?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
    ],
  },
  promoBanner: {
    enabled: true,
    tag: "Festive Season Special ✨",
    title: "Handmade with Love, Ready to Gift",
    subtitle: "Looking for something unique? Order a customized crochet piece with personalized colours and names.",
    ctaText: "Order Custom Piece",
    ctaLink: "/custom-orders",
    couponCode: "HANDMADE15",
    discountBadge: "15% OFF",
    imageUrl: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=1000&h=600&fit=crop",
  },
};

export const useBannerStore = create(
  persist(
    (set, get) => ({
      ...DEFAULT_BANNER_STATE,

      updateTopAnnouncement: (data) => {
        const nextTop = { ...get().topAnnouncement, ...data };
        set({ topAnnouncement: nextTop });
        broadcastSync("SYNC_BANNERS", { ...get(), topAnnouncement: nextTop });
      },

      updateHeroBanner: (data) => {
        const nextHero = { ...get().heroBanner, ...data };
        set({ heroBanner: nextHero });
        broadcastSync("SYNC_BANNERS", { ...get(), heroBanner: nextHero });
      },

      updatePromoBanner: (data) => {
        const nextPromo = { ...get().promoBanner, ...data };
        set({ promoBanner: nextPromo });
        broadcastSync("SYNC_BANNERS", { ...get(), promoBanner: nextPromo });
      },

      setAllBanners: (allBanners) => {
        set(allBanners);
        broadcastSync("SYNC_BANNERS", allBanners);
      },

      resetBanners: () => {
        set(DEFAULT_BANNER_STATE);
        broadcastSync("SYNC_BANNERS", DEFAULT_BANNER_STATE);
      },
    }),
    {
      name: "syt-custom-banners",
    }
  )
);
