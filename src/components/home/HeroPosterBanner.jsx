import React from "react";
import { useProductStore } from "../../store";

// Reliable fallback image: authentic handmade crochet bunny
const SAFE_FALLBACK =
  "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=800&fit=crop";

export default function HeroPosterBanner({ images = [] }) {
  const storeProducts = useProductStore((s) => s.products) || [];

  // Verified authentic crochet creations fallback collection
  const fallbackCol1 = [
    {
      id: "c1-1",
      title: "Pastel Bunny Amigurumi",
      image:
        images[0] ||
        "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&h=800&fit=crop",
    },
    {
      id: "c1-2",
      title: "Boho Crochet Crop Top",
      image:
        "https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=600&h=800&fit=crop",
    },
    {
      id: "c1-3",
      title: "Strawberry Charm",
      image:
        "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=600&h=800&fit=crop",
    },
    {
      id: "c1-4",
      title: "Dino Plushie Mascot",
      image:
        "https://images.unsplash.com/photo-1602491453631-e2a5ad90a131?w=600&h=800&fit=crop",
    },
  ];

  const fallbackCol2 = [
    {
      id: "c2-1",
      title: "Bohemian Market Tote",
      image:
        images[1] ||
        "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&h=800&fit=crop",
    },
    {
      id: "c2-2",
      title: "Sunrise Macramé Hanging",
      image:
        images[2] ||
        "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&h=800&fit=crop",
    },
    {
      id: "c2-3",
      title: "Chunky Wool Scarf",
      image:
        images[3] ||
        "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&h=800&fit=crop",
    },
    {
      id: "c2-4",
      title: "Crochet Mini Crossbody",
      image:
        "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&h=800&fit=crop",
    },
  ];

  const fallbackCol3 = [
    {
      id: "c3-1",
      title: "Boho Plant Hanger Set",
      image:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=800&fit=crop",
    },
    {
      id: "c3-2",
      title: "Newborn Baby Booties",
      image:
        "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=800&fit=crop",
    },
    {
      id: "c3-3",
      title: "Slouchy Crochet Beanie",
      image:
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&h=800&fit=crop",
    },
    {
      id: "c3-4",
      title: "Organic Baby Blanket",
      image:
        "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=800&fit=crop",
    },
  ];

  // Helper to map live store products into columns, falling back to verified crochet works
  const col1 = storeProducts.length >= 4
    ? storeProducts.slice(0, 4).map((p, i) => ({
        id: p.id || `c1-${i}`,
        title: p.name,
        image: p.images?.[0] || fallbackCol1[i]?.image || SAFE_FALLBACK,
      }))
    : fallbackCol1;

  const col2 = storeProducts.length >= 8
    ? storeProducts.slice(4, 8).map((p, i) => ({
        id: p.id || `c2-${i}`,
        title: p.name,
        image: p.images?.[0] || fallbackCol2[i]?.image || SAFE_FALLBACK,
      }))
    : fallbackCol2;

  const col3 = storeProducts.length >= 12
    ? storeProducts.slice(8, 12).map((p, i) => ({
        id: p.id || `c3-${i}`,
        title: p.name,
        image: p.images?.[0] || fallbackCol3[i]?.image || SAFE_FALLBACK,
      }))
    : fallbackCol3;

  // Duplicated arrays for seamless continuous looping
  const loopCol1 = [...col1, ...col1];
  const loopCol2 = [...col2, ...col2];
  const loopCol3 = [...col3, ...col3];

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] lg:h-[650px] overflow-hidden select-none pointer-events-none">
      {/* Top Subtle Gradient Fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-14 sm:h-20 bg-gradient-to-b from-white dark:from-[#09090b] to-transparent z-20" />

      {/* Bottom Subtle Gradient Fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 sm:h-20 bg-gradient-to-t from-white dark:from-[#09090b] to-transparent z-20" />

      {/* Left Subtle Edge Blend */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-white dark:from-[#09090b] to-transparent z-20" />

      {/* Right Subtle Edge Blend */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-10 bg-gradient-to-l from-white dark:from-[#09090b] to-transparent z-20" />

      {/* Tilted Perspective Plane */}
      <div
        className="absolute -top-20 -bottom-20 -left-6 -right-6 sm:-left-10 sm:-right-10 flex items-center justify-center overflow-visible"
        style={{
          transform: "rotate(-6deg) scale(1.04)",
          transformOrigin: "center center",
        }}
      >
        <div className="flex gap-3 sm:gap-4 lg:gap-5 h-full items-start">
          {/* Column 1: Scrolling Up Continuously (Never Stops on Cursor) */}
          <div className="marquee-col-up flex flex-col gap-3 sm:gap-4 lg:gap-5 flex-shrink-0 w-[140px] sm:w-[170px] lg:w-[195px] xl:w-[215px]">
            {loopCol1.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md block flex-shrink-0"
              >
                <img
                  src={card.image}
                  alt={
                    idx === 0
                      ? `Handmade crochet item 1 — ${card.title}`
                      : `Handmade crochet — ${card.title}`
                  }
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_FALLBACK;
                  }}
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                  width={300}
                  height={400}
                />
              </div>
            ))}
          </div>

          {/* Column 2: Scrolling Down Continuously (Never Stops on Cursor) */}
          <div className="marquee-col-down flex flex-col gap-3 sm:gap-4 lg:gap-5 flex-shrink-0 w-[140px] sm:w-[170px] lg:w-[195px] xl:w-[215px]">
            {loopCol2.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md block flex-shrink-0"
              >
                <img
                  src={card.image}
                  alt={`Handmade crochet — ${card.title}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_FALLBACK;
                  }}
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                  width={300}
                  height={400}
                />
              </div>
            ))}
          </div>

          {/* Column 3: Scrolling Up Continuously (Never Stops on Cursor) */}
          <div className="marquee-col-up flex flex-col gap-3 sm:gap-4 lg:gap-5 flex-shrink-0 w-[140px] sm:w-[170px] lg:w-[195px] xl:w-[215px]">
            {loopCol3.map((card, idx) => (
              <div
                key={`${card.id}-${idx}`}
                className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-md block flex-shrink-0"
              >
                <img
                  src={card.image}
                  alt={`Handmade crochet — ${card.title}`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = SAFE_FALLBACK;
                  }}
                  className="w-full h-full object-cover select-none"
                  loading="eager"
                  width={300}
                  height={400}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
