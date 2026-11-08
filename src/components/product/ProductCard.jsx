import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Check, Zap } from "lucide-react";
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group h-full flex flex-col"
    >
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-col h-full flex-1"
        aria-label={`View ${product.name}`}
      >
        <div className="card overflow-hidden cursor-pointer h-full flex flex-col flex-1 border border-border/30">
          {/* Image container */}
          <div className="relative aspect-square sm:aspect-product bg-oatmeal overflow-hidden flex-shrink-0">
            <img
              src={product.images?.[0] || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              width={400}
              height={400}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {product.isNew && (
                <span className="badge-primary text-xs font-bold shadow-xs">New</span>
              )}
              {product.isBestseller && !product.isNew && (
                <span className="badge bg-butter/95 text-cocoa text-xs font-bold shadow-xs">
                  Bestseller
                </span>
              )}
              {discount > 0 && (
                <span className="badge-error text-xs font-bold shadow-xs">{discount}% off</span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm z-10 ${
                wishlisted
                  ? "bg-primary text-white scale-110"
                  : "bg-white/90 text-warmgray hover:bg-primary hover:text-white"
              }`}
            >
              <motion.div
                animate={wishlisted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
              </motion.div>
            </button>

            {/* Quick add button - always visible on all products */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <button
                type="button"
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className={`w-full py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                  added
                    ? "bg-sage text-white shadow-sm"
                    : "bg-primary text-white hover:bg-primary-dark"
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
                      <Check size={16} /> Added!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <ShoppingBag size={16} /> Quick Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>

            {/* Out of stock */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
                <span className="bg-cocoa text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product info - flexible vertical layout with pinned bottom */}
          <div className="p-4 flex-1 flex flex-col justify-between">
            {/* Top section: Category, Title, Ratings */}
            <div>
              {/* Category */}
              <p className="text-xs text-warmgray capitalize mb-1 font-medium tracking-wide">
                {product.category.replace("-", " ")}
              </p>

              {/* Title - fixed 2-line height (h-11 = 44px) so 1-line and 2-line titles occupy identical height */}
              <h3 className="font-heading font-semibold text-cocoa text-base leading-snug line-clamp-2 h-11 flex items-start group-hover:text-primary transition-colors">
                {product.name}
              </h3>

              {/* Rating row - fixed height for perfect horizontal alignment */}
              <div className="flex items-center gap-1.5 h-5 mt-1.5 mb-2.5">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={12}
                      className={
                        s <= Math.round(product.rating)
                          ? "text-butter-dark fill-butter-dark"
                          : "text-border"
                      }
                      fill={s <= Math.round(product.rating) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <span className="text-xs text-warmgray">({product.reviewCount})</span>
              </div>
            </div>

            {/* Bottom section: Price and Customizable status with consistent spacing */}
            <div className="mt-auto pt-2 border-t border-border/30">
              <div className="flex items-baseline gap-2 h-7">
                <span className="price text-lg font-bold text-primary">
                  {formatINR(product.price)}
                </span>
                {product.comparePrice && (
                  <span className="price-compare text-sm text-warmgray line-through">
                    {formatINR(product.comparePrice)}
                  </span>
                )}
              </div>

              {/* Customizable / status slot with fixed height so every card is equal height */}
              <div className="h-5 flex items-center mt-1">
                {product.isCustomizable ? (
                  <div className="flex items-center gap-1 text-xs text-sage-dark font-medium">
                    <Zap size={11} className="text-sage" />
                    <span>Customisable</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-warmgray font-medium">
                    <Check size={11} className="text-sage" />
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

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden h-full flex flex-col border border-border/30">
      <div className="aspect-square sm:aspect-product skeleton flex-shrink-0" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="skeleton h-11 w-full rounded" />
          <div className="skeleton h-4 w-24 rounded" />
        </div>
        <div className="space-y-1.5 pt-2 border-t border-border/20">
          <div className="skeleton h-6 w-20 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}
