import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Eye, Star, Check, Zap } from "lucide-react";
import { formatINR, getDiscountPercent } from "../../lib/utils";
import { useCartStore, useWishlistStore } from "../../store";

export default function ProductCard({ product, index = 0 }) {
  const [imgIdx, setImgIdx] = useState(0);
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
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block" aria-label={`View ${product.name}`}>
        <div className="card overflow-hidden cursor-pointer">
          {/* Image container */}
          <div
            className="relative aspect-product bg-oatmeal overflow-hidden"
            onMouseEnter={() => product.images[1] && setImgIdx(1)}
            onMouseLeave={() => setImgIdx(0)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                src={product.images[imgIdx]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                loading="lazy"
                width={400}
                height={400}
              />
            </AnimatePresence>

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isNew && (
                <span className="badge-primary text-xs font-bold">New</span>
              )}
              {product.isBestseller && !product.isNew && (
                <span className="badge bg-butter/90 text-cocoa text-xs font-bold">
                  Bestseller
                </span>
              )}
              {discount > 0 && (
                <span className="badge-error text-xs font-bold">{discount}% off</span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
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

            {/* Quick add overlay */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 p-3"
              initial={{ y: 60, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
                className={`w-full btn py-2.5 text-sm rounded-2xl transition-all duration-300 ${
                  added
                    ? "bg-sage text-white"
                    : "bg-primary text-white hover:bg-primary-dark"
                }`}
              >
                <AnimatePresence mode="wait">
                  {added ? (
                    <motion.span
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <Check size={16} /> Added!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center gap-1.5"
                    >
                      <ShoppingBag size={16} /> Quick Add
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>

            {/* Out of stock */}
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <span className="bg-cocoa text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="p-4">
            {/* Category */}
            <p className="text-xs text-warmgray capitalize mb-1 font-medium">
              {product.category.replace("-", " ")}
            </p>

            {/* Name */}
            <h3 className="font-heading font-semibold text-cocoa text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={s <= Math.round(product.rating) ? "text-butter-dark fill-butter-dark" : "text-border"}
                    fill={s <= Math.round(product.rating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-xs text-warmgray">({product.reviewCount})</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="price text-lg text-primary">{formatINR(product.price)}</span>
              {product.comparePrice && (
                <span className="price-compare text-sm">{formatINR(product.comparePrice)}</span>
              )}
            </div>

            {/* Customizable badge */}
            {product.isCustomizable && (
              <div className="mt-2 flex items-center gap-1 text-xs text-sage-dark font-medium">
                <Zap size={11} />
                <span>Customisable</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton loader
export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-product skeleton" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-5 w-full rounded" />
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-6 w-20 rounded" />
      </div>
    </div>
  );
}
