import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Check, Zap } from "lucide-react";
import { formatINR, getDiscountPercent } from "../../lib/utils";
import { useCartStore, useWishlistStore } from "../../store";

export default function ProductCard({ product, index = 0 }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const discount = getDiscountPercent(product.price, product.comparePrice);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, {}, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
      className="group h-full flex flex-col"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-col h-full flex-1"
        aria-label={`View ${product.name}`}
      >
        <div className="card overflow-hidden cursor-pointer h-full flex flex-col flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 hover:border-black dark:hover:border-white transition-colors duration-200">
          {/* Edge-to-edge clean image container */}
          <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              width={400}
              height={400}
            />

            {/* Badges — High-contrast top brand style */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
              {product.isNew && (
                <span className="badge bg-white text-black border border-zinc-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 shadow-xs">
                  New
                </span>
              )}
              {product.isBestseller && !product.isNew && (
                <span className="badge bg-black text-white dark:bg-white dark:text-black text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 shadow-xs">
                  Bestseller
                </span>
              )}
              {discount > 0 && (
                <span className="badge bg-red-600 text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 shadow-xs">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Minimalist Wishlist Button */}
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 z-10 shadow-xs ${
                wishlisted
                  ? "bg-black text-white dark:bg-white dark:text-black scale-105"
                  : "bg-white/90 dark:bg-black/80 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              }`}
            >
              <Heart
                size={14}
                className={wishlisted ? "fill-current" : ""}
              />
            </button>

            {/* Quick Add Button — Nike/Adidas permanent high-contrast action */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className={`w-full py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider rounded-sm transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm ${
                  added
                    ? "bg-emerald-600 text-white"
                    : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5 font-bold"
                    >
                      <Check size={14} /> Added
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <ShoppingBag size={13} /> Quick Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Out of stock overlay */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-20">
                <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product details — Fixed-height layout with strict alignment */}
          <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
            {/* Upper: Category, Title, Rating */}
            <div>
              {/* Category */}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
                {product.category.replace("-", " ")}
              </p>

              {/* Title — strictly clamped to 2 lines with fixed height */}
              <h3 className="font-heading font-bold text-zinc-950 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 h-10 flex items-start group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                {product.name}
              </h3>

              {/* Rating row */}
              <div className="flex items-center gap-1.5 h-4 mt-1.5 mb-2">
                <div className="flex text-amber-500 dark:text-amber-400">
                  {"★".repeat(Math.round(product.rating || 5))}
                  {"☆".repeat(5 - Math.round(product.rating || 5))}
                </div>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                  ({product.reviewCount})
                </span>
              </div>
            </div>

            {/* Lower: Price and Status Pinned */}
            <div className="mt-auto pt-2.5 border-t border-zinc-100 dark:border-zinc-900">
              <div className="flex items-baseline gap-2 h-6">
                <span className="price text-base sm:text-lg font-black text-zinc-950 dark:text-white">
                  {formatINR(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="price-compare text-xs text-zinc-400 dark:text-zinc-500 line-through">
                    {formatINR(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Customisable status badge */}
              <div className="h-4 flex items-center mt-1">
                {product.isCustomizable ? (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
                    <Zap size={11} />
                    <span>Customisable</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">
                    <Check size={11} className="text-zinc-400" />
                    <span>Ready to Ship</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Minimalist Skeleton Loader
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden h-full flex flex-col bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
      <div className="aspect-square skeleton flex-shrink-0" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="skeleton h-3 w-16 rounded-xs" />
          <div className="skeleton h-10 w-full rounded-xs" />
          <div className="skeleton h-3 w-20 rounded-xs" />
        </div>
        <div className="space-y-1 pt-2.5 border-t border-zinc-100 dark:border-zinc-900">
          <div className="skeleton h-5 w-24 rounded-xs" />
          <div className="skeleton h-3 w-16 rounded-xs" />
        </div>
      </div>
    </div>
  );
}
